import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../platform/prisma/prisma.service';
import { RedisService } from '../platform/redis/redis.service';
import { StorageService } from '../platform/storage/storage.service';
import { SearchService } from '../platform/search/search.service';
import { PdfService } from '../platform/pdf/pdf.service';
import { enqueueOutboxEvent } from '../common/outbox';
import {
  INITIAL_PEGAWAI,
  INITIAL_SURAT,
  INITIAL_USULAN,
  SuratSeed,
  UsulanSeed,
} from './simulation-seed.data';
import {
  DEFAULT_DOCUMENT_TEMPLATES,
  DocumentTemplateRegistry,
  DocumentTemplateRegistrySchema,
} from './template-registry.data';

interface HttpReply {
  header(key: string, value: string): HttpReply;
  send(payload: unknown): void;
}

@Controller('simulation')
export class SimulationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly storage: StorageService,
    private readonly search: SearchService,
    private readonly pdf: PdfService,
  ) {}

  private async getDefaultActorId(): Promise<string> {
    const actor = await this.prisma.person.findFirst({ orderBy: { createdAt: 'asc' } });
    return actor?.id ?? '00000000-0000-0000-0000-000000000001';
  }

  private async ensureSeeded(): Promise<void> {
    const existingSuratCount = await this.prisma.registerEntry.count({
      where: { bookCode: 'AGENDA_SURAT_MASUK' },
    });

    if (existingSuratCount === 0) {
      const actorId = await this.getDefaultActorId();
      for (const s of INITIAL_SURAT) {
        await this.prisma.registerEntry.upsert({
          where: {
            bookCode_entryNo: { bookCode: 'AGENDA_SURAT_MASUK', entryNo: s.agenda },
          },
          update: {
            title: s.perihal,
            payload: s as unknown as Prisma.InputJsonValue,
          },
          create: {
            bookCode: 'AGENDA_SURAT_MASUK',
            entryNo: s.agenda,
            entryDate: new Date(),
            subjectType: 'SURAT_MASUK',
            title: s.perihal,
            payload: s as unknown as Prisma.InputJsonValue,
            createdBy: actorId,
          },
        });
      }
    }

    const existingUsulanCount = await this.prisma.registerEntry.count({
      where: { bookCode: 'USULAN_KEPEGAWAIAN' },
    });

    if (existingUsulanCount === 0) {
      const actorId = await this.getDefaultActorId();
      for (const u of INITIAL_USULAN) {
        await this.prisma.registerEntry.upsert({
          where: {
            bookCode_entryNo: { bookCode: 'USULAN_KEPEGAWAIAN', entryNo: u.id },
          },
          update: {
            title: `${u.jenis.toUpperCase()} - ${u.nama}`,
            payload: u as unknown as Prisma.InputJsonValue,
          },
          create: {
            bookCode: 'USULAN_KEPEGAWAIAN',
            entryNo: u.id,
            entryDate: new Date(),
            subjectType: `USULAN_${u.jenis.toUpperCase()}`,
            title: `${u.jenis.toUpperCase()} - ${u.nama}`,
            payload: u as unknown as Prisma.InputJsonValue,
            createdBy: actorId,
          },
        });
      }
    }

    const existingTemplatesCount = await this.prisma.registerEntry.count({
      where: { bookCode: 'DOCUMENT_TEMPLATES' },
    });

    if (existingTemplatesCount === 0) {
      const actorId = await this.getDefaultActorId();
      await this.prisma.registerEntry.upsert({
        where: {
          bookCode_entryNo: { bookCode: 'DOCUMENT_TEMPLATES', entryNo: 'DEFAULT_REGISTRY' },
        },
        update: {
          title: 'Registri Template Dokumen Resmi Kecamatan Tamalate',
          payload: DEFAULT_DOCUMENT_TEMPLATES as unknown as Prisma.InputJsonValue,
        },
        create: {
          bookCode: 'DOCUMENT_TEMPLATES',
          entryNo: 'DEFAULT_REGISTRY',
          entryDate: new Date(),
          subjectType: 'TEMPLATE_DOKUMEN',
          title: 'Registri Template Dokumen Resmi Kecamatan Tamalate',
          payload: DEFAULT_DOCUMENT_TEMPLATES as unknown as Prisma.InputJsonValue,
          createdBy: actorId,
        },
      });
    }
  }

  private async loadTemplateRegistry(): Promise<DocumentTemplateRegistry> {
    try {
      const cached = await this.redis.client.get('tamalate:templates:v1');
      if (cached) {
        const parsed = DocumentTemplateRegistrySchema.safeParse(JSON.parse(cached));
        if (parsed.success) return parsed.data;
      }
    } catch {
      // fallback to PostgreSQL
    }

    const row = await this.prisma.registerEntry.findUnique({
      where: {
        bookCode_entryNo: { bookCode: 'DOCUMENT_TEMPLATES', entryNo: 'DEFAULT_REGISTRY' },
      },
    });
    if (row && row.payload) {
      const parsed = DocumentTemplateRegistrySchema.safeParse(row.payload);
      if (parsed.success) {
        try {
          await this.redis.client.set('tamalate:templates:v1', JSON.stringify(parsed.data), 'EX', 3600);
        } catch {
          // non-blocking
        }
        return parsed.data;
      }
    }
    return DEFAULT_DOCUMENT_TEMPLATES;
  }

  private async appendAuditAndOutbox(params: {
    subjectType: string;
    subjectKey: string;
    action: string;
    fromState: string | null;
    toState: string;
    snapshot: Record<string, unknown>;
    topic: string;
  }): Promise<string> {
    const actorId = await this.getDefaultActorId();
    const subjectUuid = createHash('md5')
      .update(`${params.subjectType}:${params.subjectKey}`)
      .digest('hex')
      .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

    const lastAudit = await this.prisma.auditEntry.findFirst({
      orderBy: { id: 'desc' },
    });
    const prevHash = lastAudit?.ownHash ?? 'GENESIS';
    const ownHash = createHash('sha256')
      .update(`${prevHash}|${params.subjectType}|${subjectUuid}|${params.action}|${params.toState}|${Date.now()}`)
      .digest('hex');

    await this.prisma.$transaction(async (tx) => {
      await tx.auditEntry.create({
        data: {
          partitionDate: new Date(),
          subjectType: params.subjectType,
          subjectId: subjectUuid,
          action: params.action,
          actorPersonId: actorId,
          basis: 'DEFINITIF',
          fromState: params.fromState,
          toState: params.toState,
          policySnapshot: params.snapshot as Prisma.InputJsonValue,
          prevHash,
          ownHash,
        },
      });

      await enqueueOutboxEvent(
        tx,
        {
          topic: params.topic,
          subjectType: params.subjectType,
          subjectId: subjectUuid,
          payload: {
            ...params.snapshot,
            ownHash,
          } as Prisma.InputJsonValue,
        },
        this.redis,
      );
    });

    return ownHash;
  }

  @Get('bootstrap')
  async getBootstrap() {
    await this.ensureSeeded();

    const [
      suratRows,
      usulanRows,
      presensiRows,
      recentAudits,
      redisPing,
      s3Health,
      meiliHealth,
      pdfHealth,
      outboxCount,
    ] = await Promise.all([
      this.prisma.registerEntry.findMany({
        where: { bookCode: 'AGENDA_SURAT_MASUK' },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registerEntry.findMany({
        where: { bookCode: 'USULAN_KEPEGAWAIAN' },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.registerEntry.findMany({
        where: { bookCode: 'PRESENSI_HARIAN' },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      this.prisma.auditEntry.findMany({
        orderBy: { id: 'desc' },
        take: 25,
      }),
      this.redis.ping(),
      this.storage.checkHealth(),
      this.search.checkHealth(),
      this.pdf.checkHealth(),
      this.prisma.outboxEvent.count(),
    ]);

    const suratList = suratRows.map((r) => r.payload as unknown as SuratSeed);
    const usulanList = usulanRows.map((r) => r.payload as unknown as UsulanSeed);
    const presensiList = presensiRows.map((r) => r.payload as Record<string, unknown>);
    const templates = await this.loadTemplateRegistry();

    return {
      pegawai: INITIAL_PEGAWAI,
      suratList,
      usulanList,
      templates,
      presensiList:
        presensiList.length > 0
          ? presensiList
          : [
              {
                id: 'PRES-01',
                nip: '198501012010011001',
                nama: 'Budi Hartono, S.Sos',
                jabatan: 'Kasubag Umum dan Kepegawaian',
                jamMasuk: '07:34 WITA',
                jarakMeter: 18,
                status: 'tepat_waktu',
                keterangan: 'Apel Pagi · Lapangan Kantor Kecamatan Tamalate',
              },
              {
                id: 'PRES-02',
                nip: '198703152011012002',
                nama: 'Siti Maryam, S.E',
                jabatan: 'Kasi Pemerintahan & Kinerja Lurah',
                jamMasuk: '07:38 WITA',
                jarakMeter: 24,
                status: 'tepat_waktu',
                keterangan: 'Apel Pagi · Lapangan Kantor Kecamatan Tamalate',
              },
              {
                id: 'PRES-03',
                nip: '198006102005011009',
                nama: 'Hendra Wijaya, S.Sos',
                jabatan: 'Operator Pengendali Surat',
                jamMasuk: '08:11 WITA',
                jarakMeter: 39,
                status: 'terlambat',
                keterangan: 'Lewat batas apel 08:00 WITA',
              },
            ],
      audits: recentAudits.map((a) => ({
        id: a.id.toString(),
        subjectType: a.subjectType,
        subjectId: a.subjectId,
        action: a.action,
        fromState: a.fromState,
        toState: a.toState,
        ownHash: a.ownHash,
        prevHash: a.prevHash,
        snapshot: a.policySnapshot,
        createdAt: a.createdAt.toISOString(),
      })),
      telemetry: {
        outboxEvents: outboxCount,
        redis: redisPing,
        s3: s3Health,
        meilisearch: meiliHealth,
        puppeteer: pdfHealth,
      },
    };
  }

  @Get('state')
  async getState() {
    await this.ensureSeeded();
    const [personCount, sopCount, submissionCount, registerCount, auditCount, outboxCount, recentAudits, redisPing, s3Health, meiliHealth, pdfHealth] =
      await Promise.all([
        this.prisma.person.count(),
        this.prisma.sopDefinition.count(),
        this.prisma.submission.count(),
        this.prisma.registerEntry.count(),
        this.prisma.auditEntry.count(),
        this.prisma.outboxEvent.count(),
        this.prisma.auditEntry.findMany({ orderBy: { id: 'desc' }, take: 10 }),
        this.redis.ping(),
        this.storage.checkHealth(),
        this.search.checkHealth(),
        this.pdf.checkHealth(),
      ]);

    return {
      connected: true,
      counts: {
        persons: personCount,
        sops: sopCount,
        submissions: submissionCount,
        registers: registerCount,
        audits: auditCount,
        outboxEvents: outboxCount,
      },
      infrastructure: {
        redis: redisPing,
        s3: s3Health,
        meilisearch: meiliHealth,
        puppeteer: pdfHealth,
      },
      recentAudits: recentAudits.map((a) => ({
        id: a.id.toString(),
        subjectType: a.subjectType,
        subjectId: a.subjectId,
        action: a.action,
        fromState: a.fromState,
        toState: a.toState,
        ownHash: a.ownHash,
        prevHash: a.prevHash,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }

  @Post('surat-create')
  async createSurat(
    @Body()
    body: {
      agenda: string;
      nomorSurat: string;
      tanggalSurat: string;
      asal: string;
      perihal: string;
      sifat: 'B' | 'R' | 'SR';
      lampiran: string;
      actorRole?: string;
    },
  ) {
    const actorId = await this.getDefaultActorId();
    const agenda = body.agenda.trim() || `02${Math.floor(15 + Math.random() * 80)}/2026`;
    const today = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');

    const newSurat: SuratSeed = {
      agenda,
      nomorSurat: body.nomorSurat || '-',
      tanggalSurat: body.tanggalSurat || today,
      tanggalAgenda: today,
      asal: body.asal,
      perihal: body.perihal,
      sifat: body.sifat || 'B',
      lampiran: body.lampiran || '1 Berkas',
      status: 'baru',
      tahap: 1,
      penanggungJawab: 'Kasubag Umum dan Kepegawaian',
      disposisi: {
        diketahuiSekcam: false,
        parafSekcamOleh: 'Bambang Sutrisno, S.STP., M.Si (Sekcam)',
        tanggalSekcam: '',
        catatanSekcam: '',
        rekomendasiSekcam: [],
        hasParafCamat: false,
        parafOleh: 'H. Andi Saputra, S.Sos., M.Si (Camat)',
        tanggalDisposisi: '',
        instruksi: '',
        diteruskan: [],
        tteCert: null,
      },
      tindakLanjut: {
        petugas: 'Subbag Umum & Kepegawaian',
        catatan: '',
        tanggal: '',
      },
      arsip: {
        kodeKlasifikasi: '800.1',
        lokasiFisik: 'Lemari A · Rak 1',
        tahun: '2026',
        retensiTahun: 5,
        statusArsip: 'aktif',
      },
    };

    await this.prisma.registerEntry.upsert({
      where: {
        bookCode_entryNo: { bookCode: 'AGENDA_SURAT_MASUK', entryNo: agenda },
      },
      update: {
        title: newSurat.perihal,
        payload: newSurat as unknown as Prisma.InputJsonValue,
      },
      create: {
        bookCode: 'AGENDA_SURAT_MASUK',
        entryNo: agenda,
        entryDate: new Date(),
        subjectType: 'SURAT_MASUK',
        title: newSurat.perihal,
        payload: newSurat as unknown as Prisma.InputJsonValue,
        createdBy: actorId,
      },
    });

    const auditHash = await this.appendAuditAndOutbox({
      subjectType: 'SURAT_MASUK',
      subjectKey: agenda,
      action: 'REGISTRASI_AGENDA_MASUK',
      fromState: null,
      toState: 'BARU',
      snapshot: {
        agenda,
        asal: newSurat.asal,
        perihal: newSurat.perihal,
        actorRole: body.actorRole ?? 'operator',
      },
      topic: 'surat.masuk.registered',
    });

    try {
      await this.search.client.index('registers').addDocuments([
        {
          id: agenda.replace(/[^a-zA-Z0-9_-]/g, '_'),
          entryNo: agenda,
          perihal: newSurat.perihal,
          asal: newSurat.asal,
          status: newSurat.status,
        },
      ]);
    } catch {
      // non-blocking
    }

    return { surat: newSurat, auditHash };
  }

  @Post('surat-update/:agenda')
  async updateSurat(
    @Param('agenda') rawAgenda: string,
    @Body()
    body: {
      action: 'PARAF_SEKCAM' | 'DISPOSISI_CAMAT' | 'TINDAK_LANJUT' | 'ARSIPKAN';
      actorRole: string;
      catatanSekcam?: string;
      rekomendasiSekcam?: string[];
      instruksiCamat?: string;
      diteruskan?: string[];
      catatanTindakLanjut?: string;
      petugasTindakLanjut?: string;
      kodeKlasifikasi?: string;
      lokasiFisik?: string;
    },
  ) {
    const agenda = decodeURIComponent(rawAgenda);
    const existing = await this.prisma.registerEntry.findUnique({
      where: { bookCode_entryNo: { bookCode: 'AGENDA_SURAT_MASUK', entryNo: agenda } },
    });
    if (!existing) {
      throw new Error(`Surat dengan nomor agenda ${agenda} tidak ditemukan`);
    }

    const surat = existing.payload as unknown as SuratSeed;
    const prevStatus = surat.status.toUpperCase();
    const today = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');

    if (body.action === 'PARAF_SEKCAM') {
      surat.disposisi.diketahuiSekcam = true;
      surat.disposisi.tanggalSekcam = today;
      surat.disposisi.catatanSekcam =
        body.catatanSekcam || 'Telah diperiksa Sekcam, diteruskan ke meja Bapak Camat.';
      if (body.rekomendasiSekcam) {
        surat.disposisi.rekomendasiSekcam = body.rekomendasiSekcam;
      }
      surat.tahap = Math.max(surat.tahap, 2);
    } else if (body.action === 'DISPOSISI_CAMAT') {
      surat.disposisi.diketahuiSekcam = true;
      surat.disposisi.hasParafCamat = true;
      surat.disposisi.tanggalDisposisi = today;
      surat.disposisi.instruksi =
        body.instruksiCamat || 'Tindak lanjuti sesuai ketentuan dan laporkan hasilnya.';
      if (body.diteruskan && body.diteruskan.length > 0) {
        surat.disposisi.diteruskan = body.diteruskan;
      }
      surat.disposisi.tteCert = `BSRE-TML-2026-${agenda.replace(/\D/g, '')}`;
      surat.status = 'disposisi';
      surat.tahap = 2;
    } else if (body.action === 'TINDAK_LANJUT') {
      surat.tindakLanjut.catatan =
        body.catatanTindakLanjut || 'Telah diverifikasi dan diselesaikan oleh unit pelaksana.';
      surat.tindakLanjut.petugas = body.petugasTindakLanjut || surat.tindakLanjut.petugas;
      surat.tindakLanjut.tanggal = today;
      surat.status = 'proses';
      surat.tahap = 3;
    } else if (body.action === 'ARSIPKAN') {
      if (body.kodeKlasifikasi) surat.arsip.kodeKlasifikasi = body.kodeKlasifikasi;
      if (body.lokasiFisik) surat.arsip.lokasiFisik = body.lokasiFisik;
      surat.status = 'selesai';
      surat.tahap = 5;
    }

    await this.prisma.registerEntry.update({
      where: { id: existing.id },
      data: {
        payload: surat as unknown as Prisma.InputJsonValue,
      },
    });

    const auditHash = await this.appendAuditAndOutbox({
      subjectType: 'SURAT_MASUK',
      subjectKey: agenda,
      action: body.action,
      fromState: prevStatus,
      toState: surat.status.toUpperCase(),
      snapshot: {
        agenda,
        actorRole: body.actorRole,
        action: body.action,
        tteCert: surat.disposisi.tteCert,
      },
      topic: `surat.${body.action.toLowerCase()}`,
    });

    return { surat, auditHash };
  }

  @Post('usulan-advance/:id')
  async advanceUsulan(
    @Param('id') id: string,
    @Body()
    body: {
      actorRole: string;
      catatan?: string;
    },
  ) {
    const existing = await this.prisma.registerEntry.findUnique({
      where: { bookCode_entryNo: { bookCode: 'USULAN_KEPEGAWAIAN', entryNo: id } },
    });
    if (!existing) {
      throw new Error(`Usulan ${id} tidak ditemukan`);
    }

    const usulan = existing.payload as unknown as UsulanSeed;
    const prevStage = `TAHAP_${usulan.tahap}`;
    const today = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');

    if (usulan.tahap < 5) {
      usulan.tahap += 1;
    }

    if (usulan.tahap === 2) {
      usulan.catatanKasubag =
        body.catatan || 'Berkas persyaratan telah diverifikasi Kasubag Umpeg dan dinyatakan lengkap.';
    } else if (usulan.tahap === 3) {
      usulan.parafSekcam = {
        nama: 'Bambang Sutrisno, S.STP., M.Si (Sekcam)',
        tanggal: today,
        disetujui: true,
      };
    } else if (usulan.tahap === 5) {
      const seq = await this.prisma.numberSequence.upsert({
        where: { scopeKey: `SK_${usulan.jenis.toUpperCase()}_2026` },
        update: { lastValue: { increment: 1 } },
        create: { scopeKey: `SK_${usulan.jenis.toUpperCase()}_2026`, lastValue: 1 },
      });
      const padded = String(seq.lastValue).padStart(3, '0');
      usulan.penetapanCamat = {
        nama: 'H. Andi Saputra, S.Sos., M.Si (Camat)',
        tanggal: today,
        nomorSk: `822.3/${padded}/SK-${usulan.jenis.toUpperCase()}/TML/2026`,
        tteCert: `BSRE-TML-${usulan.jenis.toUpperCase()}-${padded}`,
      };
      usulan.status = 'selesai';
    }

    await this.prisma.registerEntry.update({
      where: { id: existing.id },
      data: {
        payload: usulan as unknown as Prisma.InputJsonValue,
      },
    });

    const auditHash = await this.appendAuditAndOutbox({
      subjectType: `USULAN_${usulan.jenis.toUpperCase()}`,
      subjectKey: usulan.id,
      action: `MAJUKAN_TAHAP_${usulan.tahap}`,
      fromState: prevStage,
      toState: `TAHAP_${usulan.tahap}`,
      snapshot: {
        id: usulan.id,
        nama: usulan.nama,
        jenis: usulan.jenis,
        tahap: usulan.tahap,
        nomorSk: usulan.penetapanCamat?.nomorSk ?? null,
        actorRole: body.actorRole,
      },
      topic: `kepegawaian.${usulan.jenis}.stage_advanced`,
    });

    return { usulan, auditHash };
  }

  @Post('usulan-revert/:id')
  async revertUsulan(
    @Param('id') id: string,
    @Body()
    body: {
      actorRole: string;
      catatan?: string;
    },
  ) {
    const existing = await this.prisma.registerEntry.findUnique({
      where: { bookCode_entryNo: { bookCode: 'USULAN_KEPEGAWAIAN', entryNo: id } },
    });
    if (!existing) {
      throw new Error(`Usulan ${id} tidak ditemukan`);
    }

    const usulan = existing.payload as unknown as UsulanSeed & { catatanRevisi?: string };
    const prevStage = `TAHAP_${usulan.tahap}`;

    if (usulan.tahap > 1) {
      usulan.tahap -= 1;
    }
    usulan.catatanRevisi = body.catatan || 'Dikembalikan untuk perbaikan berkas kepegawaian.';
    usulan.status = 'perbaikan';

    await this.prisma.registerEntry.update({
      where: { id: existing.id },
      data: {
        payload: usulan as unknown as Prisma.InputJsonValue,
      },
    });

    const auditHash = await this.appendAuditAndOutbox({
      subjectType: `USULAN_${usulan.jenis.toUpperCase()}`,
      subjectKey: usulan.id,
      action: `KEMBALIKAN_TAHAP_${usulan.tahap}`,
      fromState: prevStage,
      toState: `TAHAP_${usulan.tahap}`,
      snapshot: {
        id: usulan.id,
        nama: usulan.nama,
        jenis: usulan.jenis,
        tahap: usulan.tahap,
        catatanRevisi: usulan.catatanRevisi,
        actorRole: body.actorRole,
      },
      topic: `kepegawaian.${usulan.jenis}.stage_reverted`,
    });

    return { usulan, auditHash };
  }

  @Post('usulan-berkas/:id')
  async toggleBerkas(
    @Param('id') id: string,
    @Body()
    body: {
      berkasKey: string;
      status: 'ada' | 'kurang' | 'perbaikan';
      actorRole?: string;
    },
  ) {
    const existing = await this.prisma.registerEntry.findUnique({
      where: { bookCode_entryNo: { bookCode: 'USULAN_KEPEGAWAIAN', entryNo: id } },
    });
    if (!existing) {
      throw new Error(`Usulan ${id} tidak ditemukan`);
    }

    const usulan = existing.payload as unknown as UsulanSeed;
    usulan.berkas = {
      ...(usulan.berkas || {}),
      [body.berkasKey]: body.status,
    };

    await this.prisma.registerEntry.update({
      where: { id: existing.id },
      data: {
        payload: usulan as unknown as Prisma.InputJsonValue,
      },
    });

    const auditHash = await this.appendAuditAndOutbox({
      subjectType: `BERKAS_${usulan.jenis.toUpperCase()}`,
      subjectKey: `${usulan.id}:${body.berkasKey}`,
      action: 'VERIFIKASI_BERKAS',
      fromState: null,
      toState: body.status.toUpperCase(),
      snapshot: {
        usulanId: usulan.id,
        berkasKey: body.berkasKey,
        status: body.status,
        actorRole: body.actorRole ?? 'kasubag',
      },
      topic: 'kepegawaian.berkas.verified',
    });

    return { usulan, auditHash };
  }

  @Post('usulan-create')
  async createUsulan(
    @Body()
    body: {
      jenis: 'kgb' | 'pangkat' | 'cuti' | 'pensiun';
      pegawaiNip: string;
      jenisCuti?: string;
      lamaHari?: number;
      tmtRencana?: string;
      catatan?: string;
    },
  ) {
    const actorId = await this.getDefaultActorId();
    const peg = (INITIAL_PEGAWAI.find((p) => p.nip === body.pegawaiNip) ?? INITIAL_PEGAWAI[0])!;
    const id = `${body.jenis.toUpperCase()}-2026-${Math.floor(100 + Math.random() * 899)}`;
    const today = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');

    const newUsulan: UsulanSeed = {
      id,
      jenis: body.jenis,
      nomorUsulan: `822.3/${Math.floor(100 + Math.random() * 899)}/${body.jenis.toUpperCase()}-TML/2026`,
      pegawaiNip: peg.nip,
      nama: peg.nama,
      gol: peg.gol,
      golBaru: body.jenis === 'pangkat' ? 'IV/a' : peg.gol,
      pangkat: peg.pangkat,
      pangkatBaru: body.jenis === 'pangkat' ? 'Pembina' : peg.pangkat,
      jabatan: peg.jabatan,
      unit: peg.unit,
      mkgLama: peg.mkgLama,
      mkgBaru: peg.mkgBaru,
      gajiLama: peg.gajiLama,
      gajiBaru: peg.gajiBaru,
      jenisCuti: body.jenisCuti || '1. Cuti Tahunan',
      lamaHari: body.lamaHari || 3,
      tmtRencana: body.tmtRencana || '01 Desember 2026',
      tanggalUsulan: today,
      tahap: 1,
      status: 'proses',
      catatanKasubag: body.catatan || 'Menunggu verifikasi berkas oleh Kasubag Umpeg.',
      parafSekcam: null,
      penetapanCamat: null,
      berkas: {
        'dokumen-utama': 'ada',
        'sk-terakhir': 'ada',
        'skp-tahunan': 'ada',
      },
    };

    await this.prisma.registerEntry.create({
      data: {
        bookCode: 'USULAN_KEPEGAWAIAN',
        entryNo: id,
        entryDate: new Date(),
        subjectType: `USULAN_${body.jenis.toUpperCase()}`,
        title: `${body.jenis.toUpperCase()} - ${peg.nama}`,
        payload: newUsulan as unknown as Prisma.InputJsonValue,
        createdBy: actorId,
      },
    });

    const auditHash = await this.appendAuditAndOutbox({
      subjectType: `USULAN_${body.jenis.toUpperCase()}`,
      subjectKey: id,
      action: 'BUAT_USULAN_BARU',
      fromState: null,
      toState: 'TAHAP_1',
      snapshot: {
        id,
        jenis: body.jenis,
        nama: peg.nama,
        nip: peg.nip,
      },
      topic: `kepegawaian.${body.jenis}.created`,
    });

    return { usulan: newUsulan, auditHash };
  }

  @Post('presensi-record')
  async recordPresensi(
    @Body()
    body: {
      nip?: string;
      nama: string;
      jabatan: string;
      jarakMeter?: number;
      photoDataUrl?: string;
    },
  ) {
    const actorId = await this.getDefaultActorId();
    const id = `PRES-${Date.now()}`;
    const jamMasuk = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WITA';
    const jarakMeter = body.jarakMeter ?? 22;
    const status = jarakMeter <= 50 ? 'tepat_waktu' : 'di_luar_radius';

    let s3Key: string | null = null;
    if (body.photoDataUrl && body.photoDataUrl.includes(',')) {
      const base64 = body.photoDataUrl.slice(body.photoDataUrl.indexOf(',') + 1);
      const buf = Buffer.from(base64, 'base64');
      const uploaded = await this.storage.putObject(
        this.storage.bucketDossier,
        `presensi/${id}.jpg`,
        buf,
        'image/jpeg',
      );
      s3Key = uploaded.key;
    }

    const record = {
      id,
      nip: body.nip ?? '198501012010011001',
      nama: body.nama,
      jabatan: body.jabatan,
      jamMasuk,
      jarakMeter,
      status: 'tepat_waktu',
      s3Key,
      keterangan: `Apel Tercatat · Radius ${jarakMeter}m dari Titik Kantor Kecamatan Tamalate`,
    };

    await this.prisma.registerEntry.create({
      data: {
        bookCode: 'PRESENSI_HARIAN',
        entryNo: id,
        entryDate: new Date(),
        subjectType: 'PRESENSI_APEL',
        title: `Presensi ${body.nama}`,
        payload: record as unknown as Prisma.InputJsonValue,
        createdBy: actorId,
      },
    });

    const auditHash = await this.appendAuditAndOutbox({
      subjectType: 'PRESENSI_APEL',
      subjectKey: id,
      action: 'REKAM_PRESENSI_KAMERA',
      fromState: null,
      toState: status.toUpperCase(),
      snapshot: {
        id,
        nama: body.nama,
        jamMasuk,
        jarakMeter,
        s3Key,
      },
      topic: 'presensi.apel.recorded',
    });

    return { record, auditHash };
  }

  @Post('dossier-upload')
  async uploadDossier(
    @Body()
    body: {
      owner: string;
      fileName: string;
      mimeType?: string;
      dataUrl: string;
    },
  ) {
    const commaIdx = body.dataUrl.indexOf(',');
    const base64 = commaIdx >= 0 ? body.dataUrl.slice(commaIdx + 1) : body.dataUrl;
    const buffer = Buffer.from(base64, 'base64');
    const safeOwner = String(body.owner || 'pegawai').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = String(body.fileName || 'dokumen.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${safeOwner}/${Date.now()}-${safeName}`;

    const uploaded = await this.storage.putObject(
      this.storage.bucketDossier,
      key,
      buffer,
      body.mimeType || 'application/octet-stream',
    );
    const presignedUrl = await this.storage.presignedGetUrl(this.storage.bucketDossier, key, 3600);

    const auditHash = await this.appendAuditAndOutbox({
      subjectType: 'DOSSIER_VAULT',
      subjectKey: key,
      action: 'UNGGAH_DOSSIER_S3',
      fromState: null,
      toState: 'TERSEGEL_S3',
      snapshot: {
        bucket: uploaded.bucket,
        key: uploaded.key,
        sha256: uploaded.sha256,
        sizeBytes: buffer.length,
      },
      topic: 'dossier.file.uploaded',
    });

    return {
      uploaded: true,
      bucket: uploaded.bucket,
      key: uploaded.key,
      sha256: uploaded.sha256,
      presignedUrl,
      sizeBytes: buffer.length,
      auditHash,
    };
  }

  @Post('render-pdf')
  async renderPdf(
    @Body()
    body: {
      title?: string;
      html: string;
    },
    @Res() reply: HttpReply,
  ) {
    const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${body.title ?? 'Dokumen Resmi Kecamatan Tamalate'}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #061B31; font-size: 11pt; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #1A2C44; padding: 6px 8px; text-align: left; font-size: 9.5pt; }
    .kop-header { text-align: center; border-bottom: 3px double #061B31; padding-bottom: 10px; margin-bottom: 18px; }
  </style>
</head>
<body>
  <div class="kop-header">
    <div style="font-size:11pt;font-weight:600;">PEMERINTAH KOTA MAKASSAR</div>
    <div style="font-size:15pt;font-weight:700;">KECAMATAN TAMALATE</div>
    <div style="font-size:9pt;">Jl. Danau Tanjung Bunga Utara No. 181, Makassar · Telp. (0411) 853241</div>
  </div>
  ${body.html}
</body>
</html>`;

    const pdfBuffer = await this.pdf.renderHtmlToPdf(fullHtml);
    const s3Key = `cetak/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.pdf`;
    const stored = await this.storage.putObject(
      this.storage.bucketArsip,
      s3Key,
      pdfBuffer,
      'application/pdf',
    );

    reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="Tamalate-${s3Key.split('/').pop()}"`)
      .header('X-Tamalate-S3-Key', stored.key)
      .header('X-Tamalate-SHA256', stored.sha256)
      .send(pdfBuffer);
  }

  @Get('templates')
  async getTemplates() {
    await this.ensureSeeded();
    return this.loadTemplateRegistry();
  }

  @Post('templates')
  async saveTemplates(
    @Body()
    body: {
      registry: DocumentTemplateRegistry;
      actorRole?: string;
    },
  ) {
    await this.ensureSeeded();
    const actorId = await this.getDefaultActorId();
    const candidate: DocumentTemplateRegistry = {
      ...(body.registry || DEFAULT_DOCUMENT_TEMPLATES),
      updatedAt: new Date().toISOString(),
      updatedBy: body.actorRole || 'Admin Tata Naskah Tamalate',
    };
    const validated = DocumentTemplateRegistrySchema.parse(candidate);

    await this.prisma.registerEntry.upsert({
      where: {
        bookCode_entryNo: { bookCode: 'DOCUMENT_TEMPLATES', entryNo: 'DEFAULT_REGISTRY' },
      },
      update: {
        title: 'Registri Template Dokumen Resmi Kecamatan Tamalate',
        payload: validated as unknown as Prisma.InputJsonValue,
      },
      create: {
        bookCode: 'DOCUMENT_TEMPLATES',
        entryNo: 'DEFAULT_REGISTRY',
        entryDate: new Date(),
        subjectType: 'TEMPLATE_DOKUMEN',
        title: 'Registri Template Dokumen Resmi Kecamatan Tamalate',
        payload: validated as unknown as Prisma.InputJsonValue,
        createdBy: actorId,
      },
    });

    try {
      await this.redis.client.set('tamalate:templates:v1', JSON.stringify(validated), 'EX', 3600);
    } catch {
      // non-blocking
    }

    let s3Key: string | null = null;
    try {
      const buf = Buffer.from(JSON.stringify(validated, null, 2), 'utf-8');
      const uploaded = await this.storage.putObject(
        this.storage.bucketDossier,
        'templates/registry-latest.json',
        buf,
        'application/json',
      );
      s3Key = uploaded.key;
    } catch {
      // non-blocking
    }

    try {
      await this.search.client.index('registers').addDocuments([
        {
          id: 'tpl_lembar_disposisi',
          entryNo: validated.lembarDisposisi.id,
          perihal: validated.lembarDisposisi.namaTemplate,
          asal: validated.lembarDisposisi.kopUnit,
          status: 'aktif',
        },
        {
          id: 'tpl_buku_agenda',
          entryNo: validated.bukuAgenda.id,
          perihal: validated.bukuAgenda.namaTemplate,
          asal: validated.bukuAgenda.kopKecamatan,
          status: 'aktif',
        },
        {
          id: 'tpl_surat_cuti',
          entryNo: validated.suratCuti.id,
          perihal: validated.suratCuti.namaTemplate,
          asal: validated.suratCuti.tujuanYth,
          status: 'aktif',
        },
      ]);
    } catch {
      // non-blocking
    }

    const auditHash = await this.appendAuditAndOutbox({
      subjectType: 'TEMPLATE_DOKUMEN',
      subjectKey: 'DEFAULT_REGISTRY',
      action: 'KOSTUMISASI_TEMPLATE_ONLYOFFICE',
      fromState: 'DEFAULT',
      toState: 'CUSTOMIZED',
      snapshot: {
        updatedAt: validated.updatedAt,
        updatedBy: validated.updatedBy,
        s3Key,
        disposisiTujuanCount: validated.lembarDisposisi.daftarTujuan.length,
        agendaKolomCount: validated.bukuAgenda.kolomTabel.filter((k) => k.enabled).length,
      },
      topic: 'document.templates.customized',
    });

    return {
      templates: validated,
      s3Key,
      auditHash,
    };
  }

  @Post('templates/reset')
  async resetTemplates() {
    await this.ensureSeeded();
    const actorId = await this.getDefaultActorId();
    await this.prisma.registerEntry.upsert({
      where: {
        bookCode_entryNo: { bookCode: 'DOCUMENT_TEMPLATES', entryNo: 'DEFAULT_REGISTRY' },
      },
      update: {
        payload: DEFAULT_DOCUMENT_TEMPLATES as unknown as Prisma.InputJsonValue,
      },
      create: {
        bookCode: 'DOCUMENT_TEMPLATES',
        entryNo: 'DEFAULT_REGISTRY',
        entryDate: new Date(),
        subjectType: 'TEMPLATE_DOKUMEN',
        title: 'Registri Template Dokumen Resmi Kecamatan Tamalate',
        payload: DEFAULT_DOCUMENT_TEMPLATES as unknown as Prisma.InputJsonValue,
        createdBy: actorId,
      },
    });
    try {
      await this.redis.client.del('tamalate:templates:v1');
    } catch {
      // non-blocking
    }
    return { templates: DEFAULT_DOCUMENT_TEMPLATES };
  }

  @Get('search')
  async searchGlobal(@Query('q') q?: string) {
    const query = (q || '').trim();
    try {
      const res = await this.search.client.index('registers').search(query, { limit: 20 });
      return {
        engine: 'meilisearch',
        query,
        hits: res.hits,
        processingTimeMs: res.processingTimeMs,
      };
    } catch {
      return {
        engine: 'fallback',
        query,
        hits: [],
        processingTimeMs: 0,
      };
    }
  }

  @Post('reset')
  async resetSimulation() {
    await this.prisma.registerEntry.deleteMany({
      where: {
        bookCode: { in: ['AGENDA_SURAT_MASUK', 'USULAN_KEPEGAWAIAN', 'PRESENSI_HARIAN'] },
      },
    });
    await this.ensureSeeded();
    return this.getBootstrap();
  }
}
