-- Добавляем новые поля в bonus_logs для более детального логирования
ALTER TABLE bonus_logs ADD COLUMN IF NOT EXISTS operation_type VARCHAR(50) DEFAULT 'bonus_change';
ALTER TABLE bonus_logs ADD COLUMN IF NOT EXISTS previous_balance INT DEFAULT 0;
ALTER TABLE bonus_logs ADD COLUMN IF NOT EXISTS new_balance INT DEFAULT 0;
ALTER TABLE bonus_logs ADD COLUMN IF NOT EXISTS order_id BIGINT;
ALTER TABLE bonus_logs ADD COLUMN IF NOT EXISTS product_id BIGINT;
ALTER TABLE bonus_logs ADD COLUMN IF NOT EXISTS admin_user_id BIGINT;
ALTER TABLE bonus_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Добавляем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_bonus_logs_operation_type ON bonus_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_bonus_logs_order_id ON bonus_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_bonus_logs_product_id ON bonus_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_bonus_logs_created_at ON bonus_logs(created_at);

-- Создаем отдельную таблицу для логов остатков товаров
CREATE TABLE IF NOT EXISTS stock_logs (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    operation_type VARCHAR(50) NOT NULL, -- 'purchase', 'sale', 'adjustment', 'return'
    quantity_change INT NOT NULL, -- + пополнение, - списание
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    reason VARCHAR(255),
    source_type VARCHAR(50), -- 'Order', 'Purchase', 'Manual', 'Return'
    source_id BIGINT,
    user_id BIGINT REFERENCES users(id),
    admin_user_id BIGINT REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- Индексы для stock_logs
CREATE INDEX IF NOT EXISTS idx_stock_logs_product_id ON stock_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_operation_type ON stock_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_stock_logs_source ON stock_logs(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_created_at ON stock_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_logs_user_id ON stock_logs(user_id);

-- Комментарии для документации
COMMENT ON TABLE stock_logs IS 'Логи изменений остатков товаров';
COMMENT ON COLUMN stock_logs.operation_type IS 'Тип операции: purchase, sale, adjustment, return';
COMMENT ON COLUMN stock_logs.quantity_change IS 'Изменение количества: + пополнение, - списание';
COMMENT ON COLUMN stock_logs.source_type IS 'Источник операции: Order, Purchase, Manual, Return';
COMMENT ON COLUMN stock_logs.metadata IS 'Дополнительные данные в JSON формате';

COMMENT ON COLUMN bonus_logs.operation_type IS 'Тип операции: bonus_earned, bonus_spent, bonus_expired, manual_adjustment';
COMMENT ON COLUMN bonus_logs.previous_balance IS 'Баланс до операции';
COMMENT ON COLUMN bonus_logs.new_balance IS 'Баланс после операции';
COMMENT ON COLUMN bonus_logs.metadata IS 'Дополнительные данные: tier_info, cashback_rate, etc.'; 