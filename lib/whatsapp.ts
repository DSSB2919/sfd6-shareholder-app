// WhatsApp Business API 服务 - Twilio 版本
// 文档: https://www.twilio.com/docs/whatsapp/api

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Twilio API 配置
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER; // 格式: whatsapp:+14155238886

/**
 * 发送 WhatsApp OTP 消息 (Twilio)
 * 
 * @param phone - 手机号 (国际格式, 如 +60123456789)
 * @param code - 6位验证码
 * @returns 是否发送成功
 */
export async function sendWhatsAppOTP(phone: string, code: string): Promise<boolean> {
  // 开发环境：仅打印日志，不实际发送
  if (IS_DEVELOPMENT) {
    console.log(`[DEV] WhatsApp OTP to ${phone}: ${code}`);
    return true;
  }

  // 检查配置
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    console.error('Twilio credentials not configured');
    return false;
  }

  try {
    const messageBody = `Your SFD6 Shareholder App verification code is: ${code}\n\nThis code will expire in 5 minutes.\nDo not share this code with anyone.`;
    
    // Twilio API 使用 Basic Auth
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'From': TWILIO_WHATSAPP_NUMBER,
        'To': `whatsapp:${phone}`,
        'Body': messageBody,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio WhatsApp API error:', error);
      return false;
    }

    const result = await response.json();
    console.log('WhatsApp OTP sent via Twilio:', result.sid);
    return true;
  } catch (error) {
    console.error('Send WhatsApp OTP error:', error);
    return false;
  }
}

/**
 * 发送普通文本消息 (Twilio)
 * 
 * @param phone - 手机号
 * @param message - 消息内容
 * @returns 是否发送成功
 */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (IS_DEVELOPMENT) {
    console.log(`[DEV] WhatsApp message to ${phone}: ${message}`);
    return true;
  }

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    console.error('Twilio credentials not configured');
    return false;
  }

  try {
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'From': TWILIO_WHATSAPP_NUMBER,
        'To': `whatsapp:${phone}`,
        'Body': message,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    return false;
  }
}

/**
 * 检查 WhatsApp API 配置状态
 */
export function getWhatsAppConfigStatus(): {
  configured: boolean;
  accountSidSet: boolean;
  authTokenSet: boolean;
  whatsappNumberSet: boolean;
  environment: string;
} {
  return {
    configured: !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER) || IS_DEVELOPMENT,
    accountSidSet: !!TWILIO_ACCOUNT_SID,
    authTokenSet: !!TWILIO_AUTH_TOKEN,
    whatsappNumberSet: !!TWILIO_WHATSAPP_NUMBER,
    environment: process.env.NODE_ENV || 'unknown',
  };
}
