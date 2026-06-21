-- 创建验证 OTP 的函数
CREATE OR REPLACE FUNCTION verify_otp(p_phone TEXT, p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- 查找未过期且未使用的 OTP
  SELECT * INTO v_record
  FROM otp_codes
  WHERE phone = p_phone
    AND code = p_code
    AND expires_at > NOW()
    AND used = FALSE
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 标记为已使用
  UPDATE otp_codes
  SET used = TRUE
  WHERE id = v_record.id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

SELECT 'verify_otp 函数创建完成！' as status;
