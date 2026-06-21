-- SFD6 Shareholder App - 示例数据种子
-- 用于初始化数据库时插入测试数据

-- ============================================
-- 1. 股东数据 (Shareholders)
-- ============================================

INSERT INTO shareholders (
  member_no, name, phone, email, share_percent, actual_investment_rm,
  points_balance, tier, weekly_points, referral_code, password_hash, is_active
) VALUES
  -- Founding Partners (20%+)
  ('SFD6-FP-001', 'MR. LEE WEN CHUIN', '+60123456789', 'lee@example.com',
   20, 192000, 185000, 'Founding Partner', 300, 'SFD6-FP-001-2026', '123456', TRUE),
  ('SFD6-FP-002', 'MS. CHEN XIAO HUA', '+60198765432', 'chen@example.com',
   25, 240000, 230000, 'Founding Partner', 300, 'SFD6-FP-002-2026', '123456', TRUE),
   
  -- Core Shareholders (10%)
  ('SFD6-CS-001', 'MR. TAN KOK WENG', '+60123456790', 'tan@example.com',
   10, 96000, 85000, 'Core Shareholder', 150, 'SFD6-CS-001-2026', '123456', TRUE),
  ('SFD6-CS-002', 'MS. LIM MEI YEE', '+60198765433', 'lim@example.com',
   10, 96000, 92000, 'Core Shareholder', 150, 'SFD6-CS-002-2026', '123456', TRUE),
   
  -- Strategic Shareholders (5%)
  ('SFD6-ST-001', 'MR. WONG CHUN MING', '+60123456791', 'wong@example.com',
   5, 48000, 45000, 'Strategic Shareholder', 80, 'SFD6-ST-001-2026', '123456', TRUE),
  ('SFD6-ST-002', 'MS. NG SIEW LING', '+60198765434', 'ng@example.com',
   5, 48000, 42000, 'Strategic Shareholder', 80, 'SFD6-ST-002-2026', '123456', TRUE),
   
  -- Lifestyle Shareholders (3%) - Sleeping
  ('SFD6-LS-001', 'MR. GOH BEE HOCK', '+60123456792', 'goh@example.com',
   3, 28800, 25000, 'Lifestyle Shareholder', 50, 'SFD6-LS-001-2026', '123456', TRUE),
   
  -- Support Shareholders (1%) - 暂不开放
  ('SFD6-SU-001', 'MS. YAP LI NA', '+60123456793', 'yap@example.com',
   1, 9600, 8500, 'Support Shareholder', 30, 'SFD6-SU-001-2026', '123456', FALSE)

ON CONFLICT (member_no) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  is_active = EXCLUDED.is_active;

-- ============================================
-- 2. 收银员数据 (Cashiers)
-- ============================================

INSERT INTO cashiers (username, name, password_hash, is_admin, is_active) VALUES
  ('admin', 'Administrator', 'admin123', TRUE, TRUE),
  ('cashier1', 'Cashier One', 'cashier123', FALSE, TRUE),
  ('cashier2', 'Cashier Two', 'cashier123', FALSE, TRUE)
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash;

-- ============================================
-- 3. 家属副卡数据 (Family Cards)
-- ============================================

INSERT INTO family_cards (shareholder_id, card_number, name, relationship, is_active) VALUES
  -- MR. LEE 的家属
  (1, 'SFD6-FP-001-F01', 'MRS. LEE', 'spouse', TRUE),
  (1, 'SFD6-FP-001-F02', 'LEE JUN HAO', 'child', TRUE),
  
  -- MS. CHEN 的家属
  (2, 'SFD6-FP-002-F01', 'MR. CHEN', 'spouse', TRUE),
  
  -- MR. TAN 的家属
  (3, 'SFD6-CS-001-F01', 'MRS. TAN', 'spouse', TRUE),
  
  -- MS. LIM 的家属
  (4, 'SFD6-CS-002-F01', 'MR. LIM', 'spouse', TRUE),
  (4, 'SFD6-CS-002-F02', 'LIM XIN YI', 'child', TRUE)
  
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. 核销记录示例 (Redemptions)
-- ============================================

INSERT INTO redemptions (
  shareholder_id, shareholder_name, shareholder_member_no,
  food_amount, alcohol_amount, total_deduct, final_pay,
  receipt_url, status, created_at, verified_at, verified_by
) VALUES
  (1, 'MR. LEE WEN CHUIN', 'SFD6-FP-001',
   350.00, 200.00, 137, 413.00,
   'https://ffgfzvnoyyvfmhuorzcw.supabase.co/storage/v1/object/public/receipts/cashier/RED_001.jpg',
   'verified', 
   NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '2 days',
   'cashier1'),
   
  (3, 'MR. TAN KOK WENG', 'SFD6-CS-001',
   280.00, 150.00, 68, 362.00,
   'https://ffgfzvnoyyvfmhuorzcw.supabase.co/storage/v1/object/public/receipts/cashier/RED_002.jpg',
   'verified',
   NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '1 day',
   'cashier2'),
   
  (5, 'MR. WONG CHUN MING', 'SFD6-ST-001',
   150.00, 80.00, 26, 204.00,
   NULL,
   'pending',
   NOW() - INTERVAL '2 hours',
   NULL,
   NULL)
   
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. 每周积分使用记录 (Weekly Points Usage)
-- ============================================

-- 获取当前 ISO 周和年份
DO $$
DECLARE
  v_year INTEGER;
  v_week INTEGER;
BEGIN
  v_year := EXTRACT(ISOYEAR FROM CURRENT_DATE);
  v_week := EXTRACT(WEEK FROM CURRENT_DATE);
  
  -- 插入本周记录（已使用）
  INSERT INTO weekly_points_usage (shareholder_id, year, week_number, used, used_at, redemption_id)
  VALUES
    (1, v_year, v_week, TRUE, NOW() - INTERVAL '2 days', 1),
    (3, v_year, v_week, TRUE, NOW() - INTERVAL '1 day', 2),
    (5, v_year, v_week, FALSE, NULL, NULL),
    (2, v_year, v_week, FALSE, NULL, NULL),
    (4, v_year, v_week, FALSE, NULL, NULL)
  ON CONFLICT (shareholder_id, year, week_number) DO UPDATE SET
    used = EXCLUDED.used,
    used_at = EXCLUDED.used_at,
    redemption_id = EXCLUDED.redemption_id;
    
  -- 插入上周记录（已使用）
  INSERT INTO weekly_points_usage (shareholder_id, year, week_number, used, used_at, redemption_id)
  VALUES
    (1, v_year, v_week - 1, TRUE, NOW() - INTERVAL '9 days', NULL),
    (2, v_year, v_week - 1, TRUE, NOW() - INTERVAL '8 days', NULL),
    (3, v_year, v_week - 1, TRUE, NOW() - INTERVAL '7 days', NULL)
  ON CONFLICT (shareholder_id, year, week_number) DO NOTHING;
  
END $$;

-- ============================================
-- 完成
-- ============================================

SELECT '数据种子插入完成!' AS status;
SELECT 
  (SELECT COUNT(*) FROM shareholders) AS shareholder_count,
  (SELECT COUNT(*) FROM cashiers) AS cashier_count,
  (SELECT COUNT(*) FROM family_cards) AS family_card_count,
  (SELECT COUNT(*) FROM redemptions) AS redemption_count,
  (SELECT COUNT(*) FROM weekly_points_usage) AS weekly_points_count;
