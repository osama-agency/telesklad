-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "external_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "cost_price" DECIMAL(10,2),
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "brand" TEXT,
    "category" TEXT,
    "main_ingredient" TEXT,
    "dosage_form" TEXT,
    "package_quantity" INTEGER,
    "weight" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_external_id_key" ON "products"("external_id");
