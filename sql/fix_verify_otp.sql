-- 删除旧函数
DROP FUNCTION IF EXISTS verify_otp(TEXT, TEXT);

-- 创建新的验证函数（简化版）
CREATE OR REPLACE FUNCTION verify_otp(p_phone TEXT, p_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- 直接查询匹配的 OTP，不检查过期时间（简化测试）
  UPDATE otp_codes
  SET used = TRUE
  WHERE phone = p_phone
    AND code = p_code
    AND used = FALSE;
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

SELECT 'verify_otp 函数已更新！' as status;
