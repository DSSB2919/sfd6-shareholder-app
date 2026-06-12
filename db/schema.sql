-- SFD6 Shareholder Lifestyle App - Database Schema
-- SQLite Database

-- Shareholders table
CREATE TABLE IF NOT EXISTS shareholders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT,
  whatsapp_number TEXT,
  share_percent INTEGER NOT NULL,
  actual_investment_rm INTEGER NOT NULL,
  points_balance INTEGER NOT NULL,
  tier TEXT NOT NULL,
  weekly_points INTEGER NOT NULL,
  referral_code TEXT UNIQUE,
  otp_code TEXT,
  otp_expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Family cards table (max 2 per shareholder)
CREATE TABLE IF NOT EXISTS family_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shareholder_id INTEGER NOT NULL,
  card_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('spouse', 'child')),
  qr_code TEXT UNIQUE NOT NULL,
  qr_expires_at DATETIME,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shareholder_id) REFERENCES shareholders(id) ON DELETE CASCADE
);

-- Cashiers table
CREATE TABLE IF NOT EXISTS cashiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Redemptions table
CREATE TABLE IF NOT EXISTS redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shareholder_id INTEGER NOT NULL,
  family_card_id INTEGER,
  cashier_id INTEGER NOT NULL,
  food_amount_rm INTEGER NOT NULL,
  alcohol_amount_rm INTEGER NOT NULL,
  points_deducted INTEGER NOT NULL,
  final_pay_rm INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shareholder_id) REFERENCES shareholders(id),
  FOREIGN KEY (family_card_id) REFERENCES family_cards(id),
  FOREIGN KEY (cashier_id) REFERENCES cashiers(id)
);

-- Points transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shareholder_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'deduct', 'weekly_grant', 'adjustment')),
  amount INTEGER NOT NULL,
  description TEXT,
  related_redemption_id INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shareholder_id) REFERENCES shareholders(id),
  FOREIGN KEY (related_redemption_id) REFERENCES redemptions(id),
  FOREIGN KEY (created_by) REFERENCES cashiers(id)
);

-- Insert default cashier (password: cashier123)
INSERT OR IGNORE INTO cashiers (username, password_hash, name, is_admin) 
VALUES ('cashier', '$2a$10$YourHashedPasswordHere', 'Default Cashier', 1);

-- Insert sample shareholder data (password will be set via OTP)
INSERT OR IGNORE INTO shareholders (
  member_no, name, phone, email, whatsapp_number,
  share_percent, actual_investment_rm, points_balance,
  tier, weekly_points, referral_code
) VALUES (
  'SFD6-FP-001', 'MR. LEE WEN CHUIN', '+60123456789', 'lee@example.com', '+60123456789',
  20, 192000, 192000,
  'Founding Partner', 300, 'SFD6-FP-2026'
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shareholders_phone ON shareholders(phone);
CREATE INDEX IF NOT EXISTS idx_shareholders_member_no ON shareholders(member_no);
CREATE INDEX IF NOT EXISTS idx_family_cards_shareholder ON family_cards(shareholder_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_shareholder ON redemptions(shareholder_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_shareholder ON points_transactions(shareholder_id);