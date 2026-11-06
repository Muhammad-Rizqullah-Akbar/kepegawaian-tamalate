export type FeatureGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export type FeatureStatus = 'planned' | 'in_progress' | 'ready' | 'deferred';

export interface FeatureDef {
  readonly code: string;
  readonly title: string;
  readonly group: FeatureGroup;
  readonly subjectType: string;
  readonly kernels: readonly string[];
  readonly status: FeatureStatus;
}

export interface GroupSummary {
  readonly group: FeatureGroup;
  readonly label: string;
  readonly total: number;
  readonly ready: number;
}

export interface FeatureListPayload {
  readonly items: readonly FeatureDef[];
  readonly groups: readonly GroupSummary[];
}

export interface FeatureStats {
  readonly total: number;
  readonly byStatus: Record<string, number>;
}

export const STATUS_LABEL: Readonly<Record<FeatureStatus, string>> = {
  planned: 'Direncanakan',
  in_progress: 'Dikerjakan',
  ready: 'Siap',
  deferred: 'Ditunda',
};
