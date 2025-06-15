/*
  Warnings:

  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productName` to the `purchase_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_userId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_productId_fkey";

-- AlterTable
ALTER TABLE "purchase_items" ADD COLUMN     "productName" TEXT NOT NULL,
ALTER COLUMN "productId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "products";
