-- Shareholders 股东表
CREATE TABLE IF NOT EXISTS shareholders (
  id SERIAL PRIMARY KEY,
  member_no VARCHAR(50) UNIQUE NOT NULL, -- 股东编号，如 SFD6-FP-001
  name VARCHAR(255) NOT NULL, -- 股东姓名
  phone VARCHAR(20) NOT NULL, -- 手机号
  email VARCHAR(255), -- 邮箱
  share_percent INTEGER NOT NULL, -- 股权百分比
  actual_investment_rm INTEGER NOT NULL, -- 实际投资额(RM)
  points_balance INTEGER NOT NULL DEFAULT 0, -- 当前积分余额
  tier VARCHAR(50) NOT NULL, -- 股东等级
  weekly_points INTEGER NOT NULL DEFAULT 0, -- 每周可用积分额度
  referral_code VARCHAR(50) UNIQUE, -- 推荐码
  password_hash VARCHAR(255), -- 登录密码
  is_active BOOLEAN DEFAULT TRUE, -- 是否激活
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_shareholders_phone ON shareholders(phone);
CREATE INDEX IF NOT EXISTS idx_shareholders_member_no ON shareholders(member_no);
CREATE INDEX IF NOT EXISTS idx_shareholders_referral_code ON shareholders(referral_code);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shareholders_updated_at ON shareholders;
CREATE TRIGGER update_shareholders_updated_at
  BEFORE UPDATE ON shareholders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据（默认密码：123456）
INSERT INTO shareholders (
  member_no, name, phone, email, share_percent, actual_investment_rm,
  points_balance, tier, weekly_points, referral_code, password_hash, is_active
) VALUES
  ('SFD6-FP-001', 'MR. LEE WEN CHUIN', '+60123456789', 'lee@example.com',
   20, 192000, 192000, 'Founding Partner', 300, 'SFD6-FP-2026', '123456', TRUE),
  ('SFD6-CS-001', 'MS. TAN MEI LING', '+60198765432', 'tan@example.com',
   10, 96000, 96000, 'Core Shareholder', 150, 'SFD6-CS-2026', '123456', TRUE)
ON CONFLICT (member_no) DO UPDATE SET password_hash = EXCLUDED.password_hash;
