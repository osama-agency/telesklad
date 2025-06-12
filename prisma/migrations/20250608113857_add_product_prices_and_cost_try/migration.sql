-- AlterTable
ALTER TABLE "products" ADD COLUMN     "cost_price_try" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "product_prices" (
    "id" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "cost_price_try" DECIMAL(10,2) NOT NULL,
    "cost_price_rub" DECIMAL(10,2) NOT NULL,
    "retail_price" DECIMAL(10,2) NOT NULL,
    "exchange_rate" DECIMAL(10,4) NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_prices_product_id_effective_date_idx" ON "product_prices"("product_id", "effective_date");

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
