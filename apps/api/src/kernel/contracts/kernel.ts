import type { SubjectRef } from '../../shared/subject';

export interface KernelAuditPort {
  record(input: {
    subject: SubjectRef;
    action: string;
    actorPersonId: string;
    onBehalfOfPersonId?: string;
    basis: string;
    fromState?: string;
    toState?: string;
    policySnapshot?: Record<string, unknown>;
  }): Promise<{ entryId: string; ownHash: string }>;
}

export interface KernelAuthorityPort {
  resolveHolder(positionCode: string, asOf: Date): Promise<string | null>;
  resolveChain(positionCode: string, asOf: Date): Promise<readonly string[]>;
}

export interface KernelNumberingPort {
  allocate(input: { schemeCode: string; unitId: string; at: Date }): Promise<string>;
}

export interface KernelWorkflowPort {
  pinVersion(sopCode: string, at: Date): Promise<{ versionId: string; stateCodes: readonly string[] }>;
  transition(input: { submissionId: string; toState: string; actorPersonId: string; basis: string }): Promise<void>;
}
