-- Скрипт для мониторинга производительности базы данных TeleSklad
-- Используйте этот скрипт для анализа медленных запросов и оптимизации

-- 1. Включение логирования медленных запросов (выполнить от имени суперпользователя)
-- ALTER SYSTEM SET log_min_duration_statement = 1000; -- логировать запросы > 1 секунды
-- ALTER SYSTEM SET log_statement_stats = on;
-- SELECT pg_reload_conf();

-- 2. Топ медленных запросов (требует pg_stat_statements extension)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC 
LIMIT 10;

-- 3. Анализ использования индексов
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan,
  CASE 
    WHEN idx_scan = 0 THEN 'UNUSED INDEX'
    WHEN idx_tup_read = 0 THEN 'NEVER READ'
    ELSE 'ACTIVE'
  END as status
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- 4. Размеры таблиц и индексов
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
  pg_stat_get_tuples_returned(c.oid) as tuples_returned,
  pg_stat_get_tuples_fetched(c.oid) as tuples_fetched
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 5. Статистика по таблицам (операции чтения/записи)
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  n_live_tup,
  n_dead_tup,
  CASE 
    WHEN seq_scan > idx_scan THEN 'MORE SEQUENTIAL SCANS'
    WHEN idx_scan > seq_scan * 10 THEN 'GOOD INDEX USAGE'
    ELSE 'MIXED USAGE'
  END as scan_pattern
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY seq_scan DESC;

-- 6. Анализ блокировок
SELECT 
  pg_stat_activity.pid,
  pg_stat_activity.usename,
  pg_stat_activity.query,
  pg_stat_activity.state,
  pg_locks.mode,
  pg_locks.locktype,
  pg_locks.relation::regclass
FROM pg_stat_activity
JOIN pg_locks ON pg_stat_activity.pid = pg_locks.pid
WHERE pg_stat_activity.state != 'idle'
ORDER BY pg_stat_activity.query_start;

-- 7. Кэш-хиты по таблицам
SELECT 
  schemaname,
  tablename,
  heap_blks_read,
  heap_blks_hit,
  CASE 
    WHEN heap_blks_hit + heap_blks_read = 0 THEN 0
    ELSE round(100.0 * heap_blks_hit / (heap_blks_hit + heap_blks_read), 2)
  END as cache_hit_ratio
FROM pg_statio_user_tables 
WHERE schemaname = 'public'
ORDER BY cache_hit_ratio ASC;

-- 8. Проверка автовакуума
SELECT 
  schemaname,
  tablename,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  vacuum_count,
  autovacuum_count,
  analyze_count,
  autoanalyze_count
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY last_autovacuum DESC NULLS LAST;

-- 9. Активные подключения
SELECT 
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active_connections,
  count(*) FILTER (WHERE state = 'idle') as idle_connections,
  count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity;

-- 10. Рекомендации по оптимизации для TeleSklad
SELECT 'OPTIMIZATION RECOMMENDATIONS' as category, 'Check these areas:' as recommendation
UNION ALL
SELECT 'INDEXES', 'Ensure all foreign keys have indexes'
UNION ALL  
SELECT 'QUERIES', 'Use EXPLAIN ANALYZE for slow queries'
UNION ALL
SELECT 'CACHING', 'Consider Redis for analytics data'
UNION ALL
SELECT 'PAGINATION', 'Always use LIMIT/OFFSET for large datasets'
UNION ALL
SELECT 'VACUUM', 'Monitor autovacuum performance'
UNION ALL
SELECT 'CONNECTIONS', 'Use connection pooling (pgbouncer)'; 