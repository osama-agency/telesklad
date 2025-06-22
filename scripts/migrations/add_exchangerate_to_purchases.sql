-- Добавление поля exchangerate в таблицу purchases
ALTER TABLE "purchases" ADD COLUMN "exchangerate" DECIMAL(10,4);