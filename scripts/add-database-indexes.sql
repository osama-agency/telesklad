-- Скрипт для добавления индексов для оптимизации N+1 запросов
-- TeleSklad Database Performance Optimization

-- Индексы для purchases и purchase_items (для оптимизации загрузки закупок)
CREATE INDEX IF NOT EXISTS idx_purchases_createdat ON purchases(createdat DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_userid ON purchases(userid);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchaseid ON purchase_items(purchaseid);
CREATE INDEX IF NOT EXISTS idx_purchase_items_productid ON purchase_items(productid);

-- Индексы для orders и order_items (для оптимизации аналитики)
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders(paid_at DESC) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Составной индекс для аналитики продаж
CREATE INDEX IF NOT EXISTS idx_order_items_product_paid_at ON order_items(product_id, order_id) 
  WHERE EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.paid_at IS NOT NULL);

-- Индексы для products (для быстрого поиска товаров)
CREATE INDEX IF NOT EXISTS idx_products_ancestry ON products(ancestry) WHERE ancestry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_is_visible ON products(is_visible) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);

-- Составной индекс для видимых товаров
CREATE INDEX IF NOT EXISTS idx_products_visible_active ON products(is_visible, deleted_at, ancestry) 
  WHERE is_visible = true AND deleted_at IS NULL AND ancestry LIKE '%/%';

-- Индексы для expenses (для аналитики расходов)
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_userid_date ON expenses(userid, date DESC);

-- Индексы для users (для связей)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tg_id ON users(tg_id);

-- Индексы для закупок в пути (для аналитики)
CREATE INDEX IF NOT EXISTS idx_purchase_items_status_product ON purchase_items(productid) 
  WHERE EXISTS (SELECT 1 FROM purchases p WHERE p.id = purchase_items.purchaseid AND p.status = 'sent');

-- Индексы для exchange_rates
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_date ON exchange_rates(currency, effectiveDate DESC);

-- Статистика по созданным индексам
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('purchases', 'purchase_items', 'orders', 'order_items', 'products', 'expenses', 'users')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname; 