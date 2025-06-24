-- Добавляем поле photos в таблицу reviews
-- Поле будет хранить массив URL фотографий в формате JSON

ALTER TABLE reviews 
ADD COLUMN photos TEXT[] DEFAULT '{}';

-- Добавляем индекс для поиска по фотографиям (если понадобится)
CREATE INDEX idx_reviews_photos ON reviews USING GIN (photos); 