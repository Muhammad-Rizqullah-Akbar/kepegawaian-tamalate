import { z } from 'zod';

export const CreateSubmissionSchema = z.object({
  sopCode: z.string().min(3).max(40),
  subjectType: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/),
  submittedBy: z.string().uuid(),
  unitId: z.string().uuid(),
  payload: z.record(z.unknown()),
});

export const TransitionSchema = z.object({
  toState: z.string().min(2).max(40),
  actorPersonId: z.string().uuid(),
  basis: z.string().min(3).max(160),
  onBehalfOfPersonId: z.string().uuid().optional(),
  note: z.string().max(500).optional(),
});

export const ListQuerySchema = z.object({
  sopCode: z.string().optional(),
  currentState: z.string().optional(),
  subjectType: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
});

export type CreateSubmissionInput = z.infer<typeof CreateSubmissionSchema>;
export type TransitionInput = z.infer<typeof TransitionSchema>;
export type ListQueryInput = z.infer<typeof ListQuerySchema>;
