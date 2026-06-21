-- 创建所有需要的表并禁用 RLS

-- 1. shareholders 表（已存在，只禁用 RLS）
ALTER TABLE IF EXISTS shareholders DISABLE ROW LEVEL SECURITY;

-- 2. 创建 weekly_points_usage 表
CREATE TABLE IF NOT EXISTS weekly_points_usage (
  id SERIAL PRIMARY KEY,
  shareholder_id INTEGER NOT NULL REFERENCES shareholders(id),
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  redemption_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shareholder_id, year, week_number)
);
ALTER TABLE weekly_points_usage DISABLE ROW LEVEL SECURITY;

-- 3. 创建 redemptions 表
CREATE TABLE IF NOT EXISTS redemptions (
  id SERIAL PRIMARY KEY,
  shareholder_id INTEGER NOT NULL REFERENCES shareholders(id),
  shareholder_name VARCHAR(255) NOT NULL,
  shareholder_member_no VARCHAR(50) NOT NULL,
  food_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  alcohol_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_deduct INTEGER NOT NULL DEFAULT 0,
  final_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
  receipt_url VARCHAR(500),
  receipt_path VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by VARCHAR(100)
);
ALTER TABLE redemptions DISABLE ROW LEVEL SECURITY;

-- 4. 创建 family_cards 表
CREATE TABLE IF NOT EXISTS family_cards (
  id SERIAL PRIMARY KEY,
  shareholder_id INTEGER NOT NULL REFERENCES shareholders(id),
  card_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(20) NOT NULL,
  qr_code TEXT,
  qr_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE family_cards DISABLE ROW LEVEL SECURITY;

-- 5. 创建 cashiers 表
CREATE TABLE IF NOT EXISTS cashiers (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE cashiers DISABLE ROW LEVEL SECURITY;

-- 6. 创建 OTP 表
CREATE TABLE IF NOT EXISTS otps (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE otps DISABLE ROW LEVEL SECURITY;

-- 插入默认收银员
INSERT INTO cashiers (username, name, password_hash, is_admin, is_active) VALUES
  ('admin', 'Administrator', 'admin123', TRUE, TRUE),
  ('cashier', 'Cashier', 'cashier123', FALSE, TRUE)
ON CONFLICT (username) DO NOTHING;

SELECT '所有表创建完成并禁用 RLS！' as status;
