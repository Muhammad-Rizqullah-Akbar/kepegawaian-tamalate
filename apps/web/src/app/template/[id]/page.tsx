import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { TemplateStudio } from '@/components/template/TemplateStudio';
import { findTemplateMeta } from '@/lib/template-catalog';

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function TemplateDetailPage({ params }: PageProps): Promise<ReactNode> {
  const { id } = await params;
  const meta = findTemplateMeta(id);
  if (!meta) notFound();

  return (
    <DashboardShell active="template" crumb={meta.nama}>
      <TemplateStudio
        id={meta.id}
        nama={meta.nama}
        kode={meta.kode}
        orientasi={meta.orientasi}
        format={meta.format}
        fieldKunci={meta.fieldKunci}
      />
    </DashboardShell>
  );
}
