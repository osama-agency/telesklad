-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "bank_card" TEXT,
ADD COLUMN     "bonus" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "customer_city" TEXT,
ADD COLUMN     "delivery_cost" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "shipped_at" TIMESTAMP(3),
ALTER COLUMN "currency" SET DEFAULT 'RUB';
