import type { ReactNode } from 'react';

const TONE: Record<string, string> = {
  DRAFT: 'border-info/30 bg-info/10 text-info',
  CALON: 'border-info/30 bg-info/10 text-info',
  WATCH: 'border-info/30 bg-info/10 text-info',
  CANDIDATE: 'border-info/30 bg-info/10 text-info',
  COLLECTING: 'border-warn/30 bg-warn/10 text-warn',
  COMPLETED_REQ: 'border-warn/30 bg-warn/10 text-warn',
  LEGALISIR: 'border-warn/30 bg-warn/10 text-warn',
  VERIFIED: 'border-ok/30 bg-ok/10 text-ok',
  VALIDATED: 'border-ok/30 bg-ok/10 text-ok',
  CHECKED: 'border-ok/30 bg-ok/10 text-ok',
  APPROVED: 'border-ok/30 bg-ok/10 text-ok',
  APPROVED_CAMAT: 'border-ok/30 bg-ok/10 text-ok',
  SIGNED_CAMAT: 'border-ok/30 bg-ok/10 text-ok',
  PARAF_SEKCAM: 'border-accent/40 bg-accent/10 text-accent',
  SENT_EXTERNAL: 'border-warn/40 bg-warn/10 text-warn',
  RETURNED_EXTERNAL: 'border-warn/40 bg-warn/10 text-warn',
};

export function StateBadge({ code }: { code: string }): ReactNode {
  const tone = TONE[code] ?? 'border-line bg-line/30 muted';
  return (
    <span className={'inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium ' + tone}>
      {code}
    </span>
  );
}
