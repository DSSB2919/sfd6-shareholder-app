# WhatsApp Business API 接入指南

## 方案选择

### 方案 1: 官方 BSP (Business Solution Provider) - 推荐

**马来西亚/新加坡可用 BSP：**

| BSP | 网站 | 特点 |
|-----|------|------|
| **360dialog** | 360dialog.com | 性价比高，€49/月起 |
| **Twilio** | twilio.com | 知名大厂，$0.005/消息 |
| **Vonage** | vonage.com | 企业级服务 |
| **MessageBird** | messagebird.com | 欧洲起家，覆盖广 |

**360dialog 价格参考：**
- 月费: €49 (~RM250)
- 消息费: ~$0.003-0.008/条
- 需要 Facebook Business 验证

### 方案 2: Meta 官方 Cloud API (Direct)

**优点：**
- 无月费
- 按消息付费
- 直接对接 Meta

**缺点：**
- 需要技术团队自行开发
- 需要服务器托管
- 需要通过 Meta 审核

**价格：**
- 用户发起对话: 免费
- 企业发起对话 (24小时外): ~$0.005-0.015/条

---

## 推荐方案: 360dialog

### 为什么选 360dialog？
1. **价格透明** - €49/月固定费用
2. **API 友好** - RESTful API，文档清晰
3. **快速开通** - 通常 1-3 个工作日
4. **支持 OTP** - 支持验证码类消息

### 接入步骤

#### 1. 注册 360dialog
- 访问 https://360dialog.com
- 注册账号并选择计划
- 完成 Facebook Business 验证

#### 2. 获取 API Key
```
Dashboard → API Keys → Generate New Key
```

#### 3. 配置环境变量
```env
# .env.local
WHATSAPP_API_KEY=your_360dialog_api_key
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

#### 4. 发送 OTP 消息

```typescript
// lib/whatsapp.ts
const WHATSAPP_API_URL = 'https://waba.360dialog.io/v1/messages';

export async function sendWhatsAppOTP(phone: string, code: string): Promise<boolean> {
  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': process.env.WHATSAPP_API_KEY!,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'template',
        template: {
          name: 'otp_verification', // 需要先在 360dialog 创建模板
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

    return response.ok;
  } catch (error) {
    console.error('Send WhatsApp OTP error:', error);
    return false;
  }
}
```

#### 5. 创建消息模板

在 360dialog Dashboard 创建模板：

**模板名称:** `otp_verification`
**语言:** English
**内容:**
```
Your SFD6 Shareholder App verification code is: {{1}}

This code will expire in 5 minutes.
Do not share this code with anyone.
```

**变量:** {{1}} = 验证码

---

## 快速测试方案

在正式接入 BSP 前，可以先使用以下方式测试：

### 临时方案: 短信网关 (SMS)

如果 WhatsApp API 审核需要时间，可以先用 SMS：

**马来西亚 SMS 提供商：**
| 提供商 | 价格 | 网站 |
|--------|------|------|
| Twilio SMS | ~$0.02/条 | twilio.com |
| Vonage SMS | ~$0.01/条 | vonage.com |
| SMS123 | ~RM0.05/条 | sms123.my |

### 测试模式

当前代码已支持测试模式，OTP 会显示在页面上：

```typescript
// 开发环境返回 OTP
return NextResponse.json({
  success: true,
  message: 'OTP sent successfully',
  debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined,
});
```

---

## 下一步行动

1. **立即行动** - 注册 360dialog 账号 (https://360dialog.com)
2. **准备材料** - 公司注册文件、Facebook Business Manager
3. **等待审核** - 通常 1-3 个工作日
4. **创建模板** - 在 Dashboard 创建 OTP 模板
5. **更新代码** - 替换 `sendWhatsAppOTP` 函数

---

## 注意事项

1. **号码格式** - 必须使用国际格式 (+60123456789)
2. **模板审核** - 所有消息模板需要 Meta 审核
3. **24小时规则** - 用户最后一条消息 24 小时内可免费回复
4. **退订处理** - 必须处理用户 stop/unsubscribe 请求

---

## 参考链接

- [360dialog Documentation](https://docs.360dialog.com/)
- [Meta WhatsApp Business API](https://business.whatsapp.com/products/business-platform)
- [WhatsApp Business Policy](https://business.whatsapp.com/policy)
