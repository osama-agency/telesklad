-- Добавляем поле show_in_webapp в таблицу products
ALTER TABLE products ADD COLUMN show_in_webapp BOOLEAN DEFAULT true;

-- Обновляем существующие записи
UPDATE products SET show_in_webapp = true WHERE show_in_webapp IS NULL;

-- Добавляем комментарий к полю
COMMENT ON COLUMN products.show_in_webapp IS 'Показывать товар в WebApp для клиентов'; 