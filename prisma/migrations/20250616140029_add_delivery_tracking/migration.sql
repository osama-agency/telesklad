-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "deliveryDays" INTEGER,
ADD COLUMN     "orderDate" TIMESTAMP(3),
ADD COLUMN     "receivedDate" TIMESTAMP(3),
ADD COLUMN     "supplierDeliveryDays" INTEGER;

-- CreateTable
CREATE TABLE "supplier_stats" (
    "id" SERIAL NOT NULL,
    "supplier" TEXT NOT NULL,
    "totalPurchases" INTEGER NOT NULL DEFAULT 0,
    "completedPurchases" INTEGER NOT NULL DEFAULT 0,
    "avgDeliveryDays" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "totalDeliveryDays" INTEGER NOT NULL DEFAULT 0,
    "minDeliveryDays" INTEGER,
    "maxDeliveryDays" INTEGER,
    "lastDeliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supplier_stats_supplier_key" ON "supplier_stats"("supplier");
