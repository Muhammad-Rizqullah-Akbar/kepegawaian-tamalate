import { z } from 'zod';

export const SubjectRef = z.object({
  subjectType: z.string().min(3),
  subjectId: z.string().uuid(),
});

export type SubjectRef = z.infer<typeof SubjectRef>;
