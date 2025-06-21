-- CreateTable
CREATE TABLE "notification_jobs" (
    "id" BIGSERIAL NOT NULL,
    "job_type" VARCHAR(50) NOT NULL,
    "target_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "scheduled_at" TIMESTAMP(6) NOT NULL,
    "executed_at" TIMESTAMP(6),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_jobs_scheduled_at_status_idx" ON "notification_jobs"("scheduled_at", "status");

-- CreateIndex
CREATE INDEX "notification_jobs_job_type_idx" ON "notification_jobs"("job_type");

-- CreateIndex
CREATE INDEX "notification_jobs_user_id_idx" ON "notification_jobs"("user_id");

-- CreateIndex
CREATE INDEX "notification_jobs_target_id_idx" ON "notification_jobs"("target_id");

-- AddForeignKey
ALTER TABLE "notification_jobs" ADD CONSTRAINT "notification_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; 