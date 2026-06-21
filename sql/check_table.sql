-- 检查 shareholders 表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shareholders' 
ORDER BY ordinal_position;
