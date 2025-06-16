-- AlterTable
ALTER TABLE "purchase_items" ADD COLUMN     "totalCostRub" DECIMAL(10,2),
ADD COLUMN     "totalCostTry" DECIMAL(10,2),
ADD COLUMN     "unitCostRub" DECIMAL(10,2),
ADD COLUMN     "unitCostTry" DECIMAL(10,2),
ALTER COLUMN "costPrice" DROP NOT NULL,
ALTER COLUMN "total" DROP NOT NULL;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "exchangeRate" DECIMAL(10,4),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "supplier" TEXT,
ADD COLUMN     "totalCost" DECIMAL(10,2),
ADD COLUMN     "totalCostTRY" DECIMAL(10,2),
ALTER COLUMN "totalAmount" DROP NOT NULL;
