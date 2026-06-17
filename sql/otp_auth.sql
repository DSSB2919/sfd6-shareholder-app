-- OTP 验证码表
-- 用于存储 WhatsApp OTP 验证码

CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose VARCHAR(50) DEFAULT 'login', -- login, reset_password, etc.
  attempts INTEGER DEFAULT 0, -- 验证尝试次数
  max_attempts INTEGER DEFAULT 3,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON otp_codes(expires_at);

-- 清理过期 OTP 的函数
CREATE OR REPLACE FUNCTION cleanup_expired_otp()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 验证 OTP 函数
CREATE OR REPLACE FUNCTION verify_otp(
  p_phone VARCHAR(20),
  p_code VARCHAR(6)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- 获取最新未验证的 OTP
  SELECT * INTO v_record
  FROM otp_codes
  WHERE phone = p_phone
    AND verified = FALSE
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  -- 没有找到有效 OTP
  IF v_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 超过最大尝试次数
  IF v_record.attempts >= v_record.max_attempts THEN
    RETURN FALSE;
  END IF;

  -- 增加尝试次数
  UPDATE otp_codes
  SET attempts = attempts + 1
  WHERE id = v_record.id;

  -- 验证码不匹配
  IF v_record.code != p_code THEN
    RETURN FALSE;
  END IF;

  -- 验证成功，标记为已验证
  UPDATE otp_codes
  SET verified = TRUE
  WHERE id = v_record.id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
