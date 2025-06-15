-- AlterTable
ALTER TABLE "products" ADD COLUMN     "avgPurchasePriceRub" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "rate" DECIMAL(10,4) NOT NULL,
    "rateWithBuffer" DECIMAL(10,4) NOT NULL,
    "bufferPercent" DECIMAL(5,2) NOT NULL DEFAULT 5.0,
    "source" TEXT NOT NULL DEFAULT 'CBR',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exchange_rates_currency_idx" ON "exchange_rates"("currency");

-- CreateIndex
CREATE INDEX "exchange_rates_effectiveDate_idx" ON "exchange_rates"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_currency_effectiveDate_key" ON "exchange_rates"("currency", "effectiveDate");
