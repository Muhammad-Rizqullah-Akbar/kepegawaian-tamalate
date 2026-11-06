-- CreateTable
CREATE TABLE "person" (
    "id" UUID NOT NULL,
    "nip" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT,
    "telepon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment" (
    "id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "legal_basis" TEXT,

    CONSTRAINT "assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delegation" (
    "id" UUID NOT NULL,
    "delegate_person_id" UUID NOT NULL,
    "on_behalf_of_person_id" UUID NOT NULL,
    "scope_position_code" TEXT NOT NULL,
    "basis" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "legal_basis" TEXT NOT NULL,

    CONSTRAINT "delegation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sop_definition" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "sop_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_version" (
    "id" UUID NOT NULL,
    "sop_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),

    CONSTRAINT "workflow_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_state" (
    "id" UUID NOT NULL,
    "workflow_version_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "external" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "workflow_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission" (
    "id" UUID NOT NULL,
    "subject_type" TEXT NOT NULL,
    "sop_code" TEXT NOT NULL,
    "workflow_version_id" UUID NOT NULL,
    "current_state_code" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "submitted_by" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_entry" (
    "id" BIGSERIAL NOT NULL,
    "partition_date" DATE NOT NULL,
    "subject_type" TEXT NOT NULL,
    "subject_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "actor_person_id" UUID NOT NULL,
    "on_behalf_of_person_id" UUID,
    "basis" TEXT NOT NULL,
    "from_state" TEXT,
    "to_state" TEXT,
    "policy_snapshot" JSONB NOT NULL,
    "prev_hash" TEXT NOT NULL,
    "own_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "person_nip_key" ON "person"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "position_code_key" ON "position"("code");

-- CreateIndex
CREATE INDEX "assignment_position_id_valid_from_valid_to_idx" ON "assignment"("position_id", "valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "delegation_scope_position_code_valid_from_valid_to_idx" ON "delegation"("scope_position_code", "valid_from", "valid_to");

-- CreateIndex
CREATE UNIQUE INDEX "sop_definition_code_key" ON "sop_definition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_version_sop_id_version_key" ON "workflow_version"("sop_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_state_workflow_version_id_code_key" ON "workflow_state"("workflow_version_id", "code");

-- CreateIndex
CREATE INDEX "submission_subject_type_current_state_code_idx" ON "submission"("subject_type", "current_state_code");

-- CreateIndex
CREATE INDEX "submission_sop_code_submitted_at_idx" ON "submission"("sop_code", "submitted_at");

-- CreateIndex
CREATE INDEX "audit_entry_subject_type_subject_id_idx" ON "audit_entry"("subject_type", "subject_id");

-- CreateIndex
CREATE INDEX "audit_entry_actor_person_id_idx" ON "audit_entry"("actor_person_id");

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_version" ADD CONSTRAINT "workflow_version_sop_id_fkey" FOREIGN KEY ("sop_id") REFERENCES "sop_definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_state" ADD CONSTRAINT "workflow_state_workflow_version_id_fkey" FOREIGN KEY ("workflow_version_id") REFERENCES "workflow_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
