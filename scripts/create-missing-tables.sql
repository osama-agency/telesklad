-- Создаем таблицу purchases (закупки)
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  totalAmount FLOAT,
  status VARCHAR DEFAULT 'draft',
  isUrgent BOOLEAN DEFAULT false,
  expenses FLOAT,
  userId BIGINT NOT NULL,
  telegramMessageId INTEGER,
  telegramChatId VARCHAR,
  supplierName VARCHAR,
  supplierPhone VARCHAR,
  supplierAddress VARCHAR,
  notes TEXT,
  deliveryDate TIMESTAMP,
  deliveryTrackingNumber VARCHAR,
  deliveryStatus VARCHAR,
  deliveryCarrier VARCHAR,
  deliveryNotes TEXT,
  CONSTRAINT fk_purchases_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Создаем таблицу purchase_items (элементы закупок)
CREATE TABLE IF NOT EXISTS purchase_items (
  id SERIAL PRIMARY KEY,
  quantity INTEGER NOT NULL,
  costPrice FLOAT,
  total FLOAT,
  purchaseId INTEGER NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  productName VARCHAR NOT NULL,
  productId BIGINT NOT NULL,
  totalCostRub NUMERIC(10,2),
  totalCostTry NUMERIC(10,2),
  unitCostRub NUMERIC(10,2),
  unitCostTry NUMERIC(10,2),
  CONSTRAINT fk_purchase_items_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchase_items_purchase FOREIGN KEY (purchaseId) REFERENCES purchases(id) ON DELETE CASCADE
);

-- Создаем таблицу expenses (расходы)
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  date VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  description VARCHAR NOT NULL,
  amount FLOAT NOT NULL,
  userId BIGINT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Добавляем недостающие столбцы в order_items
ALTER TABLE order_items 
  ADD COLUMN IF NOT EXISTS orderId BIGINT,
  ADD COLUMN IF NOT EXISTS productId BIGINT,
  ADD COLUMN IF NOT EXISTS name VARCHAR,
  ADD COLUMN IF NOT EXISTS total NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Обновляем NULL значения для обязательных полей
UPDATE order_items SET orderId = order_id WHERE orderId IS NULL AND order_id IS NOT NULL;
UPDATE order_items SET productId = product_id WHERE productId IS NULL AND product_id IS NOT NULL;
UPDATE order_items SET name = 'Unknown' WHERE name IS NULL;
UPDATE order_items SET total = price * quantity WHERE total IS NULL AND price IS NOT NULL AND quantity IS NOT NULL;
UPDATE order_items SET createdAt = created_at WHERE createdAt IS NULL AND created_at IS NOT NULL;
UPDATE order_items SET updatedAt = updated_at WHERE updatedAt IS NULL AND updated_at IS NOT NULL;

-- Добавляем недостающие столбцы в orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS total NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Обновляем NULL значения
UPDATE orders SET total = total_amount WHERE total IS NULL AND total_amount IS NOT NULL;
UPDATE orders SET updatedAt = updated_at WHERE updatedAt IS NULL AND updated_at IS NOT NULL;

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_purchases_userId ON purchases(userId);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchaseId ON purchase_items(purchaseId);
CREATE INDEX IF NOT EXISTS idx_purchase_items_productId ON purchase_items(productId);
CREATE INDEX IF NOT EXISTS idx_expenses_userId ON expenses(userId);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date); 