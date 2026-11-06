-- CreateTable
CREATE TABLE "number_sequence" (
    "id" UUID NOT NULL,
    "scope_key" TEXT NOT NULL,
    "last_value" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "number_sequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "number_sequence_scope_key_key" ON "number_sequence"("scope_key");
