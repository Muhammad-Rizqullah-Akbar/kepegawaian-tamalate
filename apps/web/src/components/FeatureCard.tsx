import Link from 'next/link';
import type { ReactNode } from 'react';
import type { FeatureDef } from '@/lib/features';
import { STATUS_LABEL } from '@/lib/features';

const STATUS_STYLE: Record<string, string> = {
  planned: 'text-info border-info/30 bg-info/10',
  in_progress: 'text-warn border-warn/30 bg-warn/10',
  ready: 'text-ok border-ok/30 bg-ok/10',
  deferred: 'muted border-line bg-line/30',
};

export function FeatureCard({ feature }: { feature: FeatureDef }): ReactNode {
  return (
    <Link
      href={'/fitur/' + feature.code}
      className="group surface rounded-xl p-4 transition-colors hover:border-accent/50 focus-visible:border-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent">{feature.code}</span>
            <span className={'rounded-full border px-2 py-0.5 text-[10px] font-medium ' + (STATUS_STYLE[feature.status] ?? STATUS_STYLE.deferred)}>
              {STATUS_LABEL[feature.status]}
            </span>
          </div>
          <h3 className="mt-1.5 text-sm font-medium leading-snug group-hover:text-accent transition-colors">
            {feature.title}
          </h3>
        </div>
      </div>
      <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] muted">
        <div className="flex items-center gap-1">
          <dt>Subjek</dt>
          <dd className="font-mono">{feature.subjectType}</dd>
        </div>
        <div className="flex items-center gap-1">
          <dt>Kernel</dt>
          <dd className="font-mono">{feature.kernels.join(', ')}</dd>
        </div>
      </dl>
    </Link>
  );
}
