import { Injectable } from '@nestjs/common';
import { FEATURES, FEATURE_INDEX } from './feature.catalog';
import { GROUP_LABELS, type FeatureDef, type FeatureGroup } from './feature.types';

export interface GroupSummary {
  readonly group: FeatureGroup;
  readonly label: string;
  readonly total: number;
  readonly ready: number;
}

@Injectable()
export class FeaturesService {
  list(): readonly FeatureDef[] {
    return FEATURES;
  }

  get(code: string): FeatureDef {
    const found = FEATURE_INDEX.get(code);
    if (!found) throw new Error('Fitur tidak dikenal: ' + code);
    return found;
  }

  groups(): readonly GroupSummary[] {
    const keys = Object.keys(GROUP_LABELS) as FeatureGroup[];
    return keys.map((g) => {
      const items = FEATURES.filter((f) => f.group === g);
      return {
        group: g,
        label: GROUP_LABELS[g],
        total: items.length,
        ready: items.filter((f) => f.status === 'ready').length,
      };
    });
  }

  stats(): { total: number; byStatus: Record<string, number> } {
    const byStatus: Record<string, number> = {};
    for (const f of FEATURES) byStatus[f.status] = (byStatus[f.status] ?? 0) + 1;
    return { total: FEATURES.length, byStatus };
  }
}
