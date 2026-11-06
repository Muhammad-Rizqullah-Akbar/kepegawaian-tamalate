export interface SubjectRef { subjectType: string; subjectId: string }

export function assertSubject(subject: SubjectRef): void {
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(subject.subjectType)) {
    throw new Error('subjectType tidak valid: ' + subject.subjectType);
  }
}
