-- Weekly Points 使用记录表
-- 记录每位股东每周的积分使用状态

CREATE TABLE IF NOT EXISTS weekly_points_usage (
  id SERIAL PRIMARY KEY,
  shareholder_id INTEGER NOT NULL REFERENCES shareholders(id),
  year INTEGER NOT NULL, -- 年份，例如 2026
  week_number INTEGER NOT NULL, -- ISO 周数，1-53
  used BOOLEAN DEFAULT FALSE, -- 本周是否已使用
  used_at TIMESTAMP WITH TIME ZONE, -- 使用时间
  redemption_id INTEGER REFERENCES redemptions(id), -- 关联的核销记录
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 每个股东每年每周只能有一条记录
  UNIQUE(shareholder_id, year, week_number)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_weekly_points_shareholder ON weekly_points_usage(shareholder_id);
CREATE INDEX IF NOT EXISTS idx_weekly_points_year_week ON weekly_points_usage(year, week_number);

-- 获取当前 ISO 周数的函数
CREATE OR REPLACE FUNCTION get_iso_week(date_input DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(WEEK FROM date_input)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- 获取当前 ISO 年份的函数（处理跨年周）
CREATE OR REPLACE FUNCTION get_iso_year(date_input DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(ISOYEAR FROM date_input)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- 获取或创建本周积分记录
CREATE OR REPLACE FUNCTION get_or_create_weekly_points(p_shareholder_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  shareholder_id INTEGER,
  year INTEGER,
  week_number INTEGER,
  used BOOLEAN,
  used_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_year INTEGER;
  v_week INTEGER;
  v_record RECORD;
BEGIN
  v_year := get_iso_year();
  v_week := get_iso_week();
  
  -- 尝试获取现有记录
  SELECT * INTO v_record
  FROM weekly_points_usage
  WHERE weekly_points_usage.shareholder_id = p_shareholder_id
    AND weekly_points_usage.year = v_year
    AND weekly_points_usage.week_number = v_week;
  
  -- 如果不存在，创建新记录
  IF v_record IS NULL THEN
    INSERT INTO weekly_points_usage (shareholder_id, year, week_number, used)
    VALUES (p_shareholder_id, v_year, v_week, FALSE)
    RETURNING weekly_points_usage.* INTO v_record;
  END IF;
  
  RETURN QUERY SELECT 
    v_record.id,
    v_record.shareholder_id,
    v_record.year,
    v_record.week_number,
    v_record.used,
    v_record.used_at;
END;
$$ LANGUAGE plpgsql;

-- 标记本周积分已使用
CREATE OR REPLACE FUNCTION use_weekly_points(
  p_shareholder_id INTEGER,
  p_redemption_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_year INTEGER;
  v_week INTEGER;
  v_record RECORD;
BEGIN
  v_year := get_iso_year();
  v_week := get_iso_week();
  
  -- 获取本周记录
  SELECT * INTO v_record
  FROM weekly_points_usage
  WHERE shareholder_id = p_shareholder_id
    AND year = v_year
    AND week_number = v_week;
  
  -- 如果已使用，返回 FALSE
  IF v_record.used THEN
    RETURN FALSE;
  END IF;
  
  -- 标记为已使用
  UPDATE weekly_points_usage
  SET used = TRUE,
      used_at = NOW(),
      redemption_id = p_redemption_id,
      updated_at = NOW()
  WHERE id = v_record.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
