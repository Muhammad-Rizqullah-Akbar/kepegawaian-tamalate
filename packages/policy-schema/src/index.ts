import { z } from 'zod';

export const BupRule = z.object({
  position_code: z.string().min(1),
  tahun: z.number().int().min(50).max(75),
  source_regulation: z.string().min(1),
  status: z.enum(['confirmed', 'pending_confirmation']),
  effective_from: z.string(),
});

export const BupPack = z.object({
  version: z.string(),
  items: z.array(BupRule),
});

export type BupRule = z.infer<typeof BupRule>;
export type BupPack = z.infer<typeof BupPack>;
