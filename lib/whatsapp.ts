// WhatsApp Business API 服务
// 当前为模拟实现，需要接入真实 BSP (如 360dialog)

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// 360dialog API 配置
const D360_API_URL = 'https://waba.360dialog.io/v1';
const D360_API_KEY = process.env.WHATSAPP_API_KEY;

/**
 * 发送 WhatsApp OTP 消息
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

  // 如果没有配置 API Key，返回失败
  if (!D360_API_KEY) {
    console.error('WhatsApp API Key not configured');
    return false;
  }

  try {
    // 使用 360dialog API 发送模板消息
    const response = await fetch(`${D360_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': D360_API_KEY,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'template',
        template: {
          name: 'otp_verification', // 需要在 360dialog Dashboard 创建此模板
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: code },
              ],
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('WhatsApp API error:', error);
      return false;
    }

    const result = await response.json();
    console.log('WhatsApp message sent:', result);
    return true;
  } catch (error) {
    console.error('Send WhatsApp OTP error:', error);
    return false;
  }
}

/**
 * 发送普通文本消息 (仅用于测试)
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

  if (!D360_API_KEY) {
    console.error('WhatsApp API Key not configured');
    return false;
  }

  try {
    const response = await fetch(`${D360_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': D360_API_KEY,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'text',
        text: { body: message },
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
  apiKeySet: boolean;
  environment: string;
} {
  return {
    configured: !!D360_API_KEY || IS_DEVELOPMENT,
    apiKeySet: !!D360_API_KEY,
    environment: process.env.NODE_ENV || 'unknown',
  };
}
