-- 修复 share_percent 字段支持小数
-- 将 INTEGER 改为 DECIMAL(10,3) 支持最多3位小数

ALTER TABLE shareholders 
ALTER COLUMN share_percent TYPE DECIMAL(10,3);

-- 验证修改
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'shareholders' AND column_name = 'share_percent';
