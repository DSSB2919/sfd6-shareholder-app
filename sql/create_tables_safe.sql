-- 安全创建股东表（如果已存在则跳过）
CREATE TABLE IF NOT EXISTS shareholders (
  id SERIAL PRIMARY KEY,
  member_no VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  share_percent DECIMAL(10,3) NOT NULL,
  actual_investment_rm INTEGER NOT NULL,
  points_balance INTEGER NOT NULL DEFAULT 0,
  tier VARCHAR(50) NOT NULL,
  weekly_points INTEGER NOT NULL DEFAULT 0,
  referral_code VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引（如果已存在则跳过）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shareholders_phone') THEN
    CREATE INDEX idx_shareholders_phone ON shareholders(phone);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shareholders_member_no') THEN
    CREATE INDEX idx_shareholders_member_no ON shareholders(member_no);
  END IF;
END $$;

-- 插入测试数据（如果已存在则跳过）
INSERT INTO shareholders (
  member_no, name, phone, email, share_percent, actual_investment_rm,
  points_balance, tier, weekly_points, referral_code, password_hash, is_active
) VALUES
  ('SFD6-FP-001', 'MR. LEE WEN CHUIN', '+60123456789', 'lee@example.com',
   20, 192000, 192000, 'Founding Partner', 300, 'SFD6-FP-001-2026', '123456', TRUE),
  ('SFD6-CS-001', 'MS. TAN MEI LING', '+60198765432', 'tan@example.com',
   10, 96000, 96000, 'Core Shareholder', 150, 'SFD6-CS-001-2026', '123456', TRUE)
ON CONFLICT (member_no) DO NOTHING;

-- 创建每周积分使用记录表
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

-- 创建核销记录表
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

-- 创建家属副卡表
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

-- 创建收银员表
CREATE TABLE IF NOT EXISTS cashiers (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认收银员账号
INSERT INTO cashiers (username, name, password_hash, is_admin, is_active) VALUES
  ('admin', 'Administrator', 'admin123', TRUE, TRUE),
  ('cashier', 'Cashier', 'cashier123', FALSE, TRUE)
ON CONFLICT (username) DO NOTHING;

SELECT '所有表创建完成！' as status;
