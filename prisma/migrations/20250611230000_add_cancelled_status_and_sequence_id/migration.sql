-- Добавляем поле sequenceId для последовательной нумерации закупок
ALTER TABLE "purchases" ADD COLUMN "sequence_id" SERIAL;

-- Добавляем поле для отслеживания времени последнего обновления статуса
ALTER TABLE "purchases" ADD COLUMN "status_updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Добавляем поле для расходов на закупку
ALTER TABLE "purchases" ADD COLUMN "logistics_cost" DECIMAL(10,2) DEFAULT 0;

-- Обновляем существующие записи, устанавливая sequence_id равным id
UPDATE "purchases" SET "sequence_id" = CAST(SUBSTRING("id" FROM 'purchase_(\d+)') AS INTEGER) WHERE "id" LIKE 'purchase_%';

-- Создаем индекс для быстрого поиска по sequence_id
CREATE INDEX "purchases_sequence_id_idx" ON "purchases"("sequence_id");

-- Создаем индекс для сортировки по дате обновления статуса
CREATE INDEX "purchases_status_updated_at_idx" ON "purchases"("status_updated_at");
