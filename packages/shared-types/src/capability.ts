import { z } from 'zod';

export const Capability = z
  .string()
  .regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/);

export type Capability = z.infer<typeof Capability>;
