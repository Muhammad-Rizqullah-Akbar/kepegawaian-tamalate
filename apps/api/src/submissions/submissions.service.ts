import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../platform/prisma/prisma.service';
import { SubjectTypeService } from '../kernel/registry/subject-type.service';
import { DomainError } from '../platform/http/domain-error';
import { ErrorCode } from '../platform/http/error-codes';
import { computeHash, GENESIS_HASH, type AuditSeed } from './audit-chain';
import { rangesOverlap, validateLeaveDates, type LeavePayload } from './leave-rules';
import { isAllowed } from './authority-matrix';
import type { CreateSubmissionInput, ListQueryInput, TransitionInput } from './submission.schema';

export interface SubmissionView {
  readonly id: string;
  readonly subjectType: string;
  readonly sopCode: string;
  readonly versionId: string;
  readonly currentState: string;
  readonly payload: Record<string, unknown>;
  readonly submittedBy: string;
  readonly unitId: string;
  readonly submittedAt: string;
  readonly updatedAt: string;
  readonly closedAt: string | null;
  readonly availableStates: readonly string[];
  readonly stateHistory: readonly AuditView[];
}

export interface AuditView {
  readonly id: string;
  readonly action: string;
  readonly actorPersonId: string;
  readonly onBehalfOfPersonId: string | null;
  readonly basis: string;
  readonly fromState: string | null;
  readonly toState: string | null;
  readonly ownHash: string;
  readonly createdAt: string;
}

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subjectTypes: SubjectTypeService,
  ) {}

  async list(query: ListQueryInput): Promise<{ items: readonly SubmissionView[]; total: number; page: number; pageSize: number }> {
    const where: Record<string, unknown> = {};
    if (query.sopCode) where.sopCode = query.sopCode;
    if (query.currentState) where.currentState = query.currentState;
    if (query.subjectType) where.subjectType = query.subjectType;

    const [rows, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.submission.count({ where }),
    ]);

    const statesByVersion = await this.loadStates(rows.map((r) => r.versionId));

    const items = rows.map((row) => ({
      id: row.id,
      subjectType: row.subjectType,
      sopCode: row.sopCode,
      versionId: row.versionId,
      currentState: row.currentState,
      payload: row.payload as Record<string, unknown>,
      submittedBy: row.submittedBy,
      unitId: row.unitId,
      submittedAt: row.submittedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      closedAt: row.closedAt ? row.closedAt.toISOString() : null,
      availableStates: statesByVersion.get(row.versionId) ?? [],
      stateHistory: [],
    }));

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async detail(id: string): Promise<SubmissionView> {
    const row = await this.prisma.submission.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Submission tidak ditemukan');

    const [states, audit] = await Promise.all([
      this.loadStates([row.versionId]),
      this.prisma.auditEntry.findMany({
        where: { subjectType: row.subjectType, subjectId: row.id },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      id: row.id,
      subjectType: row.subjectType,
      sopCode: row.sopCode,
      versionId: row.versionId,
      currentState: row.currentState,
      payload: row.payload as Record<string, unknown>,
      submittedBy: row.submittedBy,
      unitId: row.unitId,
      submittedAt: row.submittedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      closedAt: row.closedAt ? row.closedAt.toISOString() : null,
      availableStates: states.get(row.versionId) ?? [],
      stateHistory: audit.map((a) => ({
        id: String(a.id),
        action: a.action,
        actorPersonId: a.actorPersonId,
        onBehalfOfPersonId: a.onBehalfOfId,
        basis: a.basis,
        fromState: a.fromState,
        toState: a.toState,
        ownHash: a.ownHash,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }

  async create(input: CreateSubmissionInput): Promise<SubmissionView> {
    this.subjectTypes.get(input.subjectType);

    const sop = await this.prisma.sopDefinition.findUnique({ where: { code: input.sopCode } });
    if (!sop) throw new DomainError(ErrorCode.VALIDATION_FAILED, 'SOP tidak terdaftar: ' + input.sopCode, 422);

    const version = await this.prisma.workflowVersion.findFirst({
      where: { sopId: sop.id, validFrom: { lte: new Date() } },
      orderBy: { version: 'desc' },
      include: { states: true },
    });
    if (!version || version.states.length === 0) {
      throw new DomainError(ErrorCode.WORKFLOW_VERSION_UNPINNED, 'Versi workflow tidak tersedia untuk SOP ' + input.sopCode, 422);
    }

    const firstState = version.states[0];
    if (!firstState) {
      throw new DomainError(ErrorCode.WORKFLOW_VERSION_UNPINNED, 'Versi workflow tanpa state awal', 422);
    }
    const initialState = firstState.code;

    if (input.subjectType === 'leave.request') {
      const check = validateLeaveDates(input.payload as LeavePayload);
      if (!check.ok) {
        throw new DomainError(
          check.code === 'LEAVE_QUOTA_EXCEEDED' ? ErrorCode.LEAVE_QUOTA_EXCEEDED : ErrorCode.LEAVE_OVERLAP,
          check.message ?? 'Data cuti tidak valid',
          422,
        );
      }
      await this.assertNoLeaveOverlap(input.submittedBy, input.payload as LeavePayload);
    }

    const now = new Date();
    const created = await this.prisma.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
          subjectType: input.subjectType,
          sopCode: input.sopCode,
          versionId: version.id,
          currentState: initialState,
          payload: input.payload as object,
          submittedBy: input.submittedBy,
          unitId: input.unitId,
        },
      });

      const last = await tx.auditEntry.findFirst({
        where: { subjectType: input.subjectType, subjectId: submission.id },
        orderBy: { createdAt: 'desc' },
      });
      const seed: AuditSeed = {
        prevHash: last?.ownHash ?? GENESIS_HASH,
        subjectType: input.subjectType,
        subjectId: submission.id,
        action: 'CREATE',
        actorPersonId: input.submittedBy,
        basis: 'PENGAJUAN_AWAL',
        fromState: null,
        toState: initialState,
        at: now.toISOString(),
      };

      await tx.auditEntry.create({
        data: {
          partitionDate: new Date(now.toISOString().slice(0, 10)),
          subjectType: seed.subjectType,
          subjectId: seed.subjectId,
          action: seed.action,
          actorPersonId: seed.actorPersonId,
          basis: seed.basis,
          fromState: seed.fromState,
          toState: seed.toState,
          policySnapshot: { sopCode: input.sopCode, versionId: version.id },
          prevHash: seed.prevHash,
          ownHash: computeHash(seed),
          createdAt: now,
        },
      });

      return submission;
    });

    return this.detail(created.id);
  }

  async transition(id: string, input: TransitionInput, positionCode: string): Promise<SubmissionView> {
    const row = await this.prisma.submission.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Submission tidak ditemukan');

    const version = await this.prisma.workflowVersion.findUnique({
      where: { id: row.versionId },
      include: { states: true },
    });
    if (!version) throw new DomainError(ErrorCode.WORKFLOW_VERSION_UNPINNED, 'Versi workflow hilang', 409);

    const target = version.states.find((s) => s.code === input.toState);
    if (!target) {
      throw new DomainError(
        ErrorCode.WORKFLOW_INVALID_TRANSITION,
        'State ' + input.toState + ' tidak ada di versi workflow yang di-pin',
        422,
      );
    }
    if (!isAllowed(row.sopCode, input.toState, positionCode)) {
      throw new DomainError(
        ErrorCode.FORBIDDEN,
        'Jabatan ' + positionCode + ' tidak berwenang memindahkan ke state ' + input.toState,
        403,
      );
    }

    if (row.currentState === input.toState) {
      throw new DomainError(ErrorCode.WORKFLOW_INVALID_TRANSITION, 'Sudah berada di state ' + input.toState, 409);
    }

    const now = new Date();
    const lastState = version.states[version.states.length - 1];
    const closedState = lastState ? lastState.code : row.currentState;
    const isClosing = input.toState === closedState;

    await this.prisma.$transaction(async (tx) => {
      await tx.submission.update({
        where: { id },
        data: { currentState: input.toState, closedAt: isClosing ? now : null },
      });

      const last = await tx.auditEntry.findFirst({
        where: { subjectType: row.subjectType, subjectId: row.id },
        orderBy: { createdAt: 'desc' },
      });
      const seed: AuditSeed = {
        prevHash: last?.ownHash ?? GENESIS_HASH,
        subjectType: row.subjectType,
        subjectId: row.id,
        action: 'TRANSITION',
        actorPersonId: input.actorPersonId,
        basis: input.basis,
        fromState: row.currentState,
        toState: input.toState,
        at: now.toISOString(),
      };

      await tx.auditEntry.create({
        data: {
          partitionDate: new Date(now.toISOString().slice(0, 10)),
          subjectType: seed.subjectType,
          subjectId: seed.subjectId,
          action: seed.action,
          actorPersonId: seed.actorPersonId,
          onBehalfOfId: input.onBehalfOfPersonId ?? null,
          basis: seed.basis,
          fromState: seed.fromState,
          toState: seed.toState,
          policySnapshot: { note: input.note ?? null, versionId: row.versionId },
          prevHash: seed.prevHash,
          ownHash: computeHash(seed),
          createdAt: now,
        },
      });
    });

    return this.detail(id);
  }

  async verifyChain(subjectType: string, subjectId: string): Promise<{ valid: boolean; entries: number; brokenAt: string | null }> {
    const rows = await this.prisma.auditEntry.findMany({
      where: { subjectType, subjectId },
      orderBy: { createdAt: 'asc' },
    });

    let prev = GENESIS_HASH;
    for (const row of rows) {
      const seed: AuditSeed = {
        prevHash: prev,
        subjectType: row.subjectType,
        subjectId: row.subjectId,
        action: row.action,
        actorPersonId: row.actorPersonId,
        basis: row.basis,
        fromState: row.fromState,
        toState: row.toState,
        at: row.createdAt.toISOString(),
      };
      if (computeHash(seed) !== row.ownHash || row.prevHash !== prev) {
        return { valid: false, entries: rows.length, brokenAt: String(row.id) };
      }
      prev = row.ownHash;
    }
    return { valid: true, entries: rows.length, brokenAt: null };
  }

  private async assertNoLeaveOverlap(personId: string, payload: LeavePayload): Promise<void> {
    const start = new Date(payload.tanggalMulai as string);
    const end = new Date(payload.tanggalSelesai as string);
    const active = await this.prisma.submission.findMany({
      where: { subjectType: 'leave.request', submittedBy: personId, closedAt: null },
    });
    for (const other of active) {
      const p = other.payload as LeavePayload;
      if (!p.tanggalMulai || !p.tanggalSelesai) continue;
      if (rangesOverlap(start, end, new Date(p.tanggalMulai), new Date(p.tanggalSelesai))) {
        throw new DomainError(ErrorCode.LEAVE_OVERLAP, 'Tumpang tindih dengan cuti aktif lain', 409);
      }
    }
  }

  private async loadStates(versionIds: readonly string[]): Promise<Map<string, readonly string[]>> {
    const unique = [...new Set(versionIds)];
    const states = await this.prisma.workflowState.findMany({
      where: { versionId: { in: unique } },
      orderBy: { code: 'asc' },
    });
    const map = new Map<string, string[]>();
    for (const s of states) {
      const arr = map.get(s.versionId) ?? [];
      arr.push(s.code);
      map.set(s.versionId, arr);
    }
    return map;
  }
}
