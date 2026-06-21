# SFD6 Shareholder App - 项目总结

## 📱 项目概述

SFD6 Shareholder App 是 Snowy Fox District Six Entertainment 的股东专属应用，为股东提供积分管理、消费抵扣、带客奖励等功能。

---

## 🏗️ 技术架构

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **图标**: 自定义 SVG Icon 组件

### 后端
- **数据库**: Supabase (PostgreSQL)
- **存储**: Supabase Storage (单据照片)
- **认证**: JWT Token
- **部署**: Vercel

### 第三方服务
- **WhatsApp OTP**: Twilio
- **二维码生成**: 自定义 HMAC-SHA256 签名

---

## 📊 数据模型

### 核心实体关系

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   shareholders  │────<│ weekly_points_usage  │     │  redemptions    │
│   (股东表)       │     │   (每周积分使用记录)   │     │   (核销记录)     │
└────────┬────────┘     └──────────────────────┘     └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│  family_cards   │
│   (家属副卡)     │
└─────────────────┘
```

---

## 🎯 功能模块

### 1. 股东端 (Shareholder App)

| 页面 | 功能 |
|------|------|
| 首页 | 股权信息、Weekly Points 状态、推荐码 |
| 积分计算器 | 计算消费可抵扣积分 |
| 股东权益 | 展示各等级权益说明 |
| 带客奖励 | 生成带客码、计算带客收益 |
| 设置 | 修改密码、退出登录 |

**核心功能:**
- OTP 登录 (WhatsApp)
- 实时积分余额显示
- 每周积分额度状态 (可用/已用完)
- 二维码生成 (自用/家属/带客)

### 2. 收银台 (Cashier)

| 页面 | 功能 |
|------|------|
| 扫码核销 | 扫描股东二维码 |
| 金额输入 | 输入食物/酒精消费金额 |
| 单据上传 | 拍照上传抵扣单据 |
| 核销确认 | 确认并保存核销记录 |

**核心功能:**
- 二维码扫描与验证
- 自动计算抵扣积分
- 自动标记 Weekly Points 使用状态
- 单据照片云端存储

### 3. 管理后台 (Admin)

| 页面 | 功能 |
|------|------|
| 股东管理 | 添加/编辑/删除股东 |
| 核销记录 | 查看所有核销历史 |
| 数据查看器 | 查看所有数据表和统计 |
| 收银台入口 | 快速进入扫码核销 |

---

## 💰 积分系统

### 每周积分额度

| 等级 | 股权 | 每周额度 |
|------|------|----------|
| Founding Partner | 20%+ | 300 分 |
| Core Shareholder | 10% | 150 分 |
| Strategic Shareholder | 5% | 80 分 |
| Lifestyle Shareholder | 3% | 50 分 |
| Support Shareholder | 1% | 30 分 |

### 消费抵扣规则 (每 RM100)

| 等级 | 食物 | 酒精 |
|------|------|------|
| Founding Partner | 25 分 | 10 分 |
| Core Shareholder | 20 分 | 8 分 |
| Strategic Shareholder | 15 分 | 5 分 |
| Lifestyle Shareholder | 12 分 | 4 分 |
| Support Shareholder | 10 分 | 3 分 |

### 带客奖励比例

| 等级 | 食物 | 酒精 |
|------|------|------|
| Founding Partner | 10% | 4% |
| Core Shareholder | 8% | 3% |
| Strategic Shareholder | 8% | 3% |
| Lifestyle Shareholder | 6% | 2.5% |
| Support Shareholder | 5% | 2% |

---

## 🔐 安全机制

### 认证
- JWT Token (有效期 24 小时)
- OTP 验证码 (WhatsApp)
- 密码最小 6 位

### QR Code
- HMAC-SHA256 签名验证
- 有效期: 5 分钟 (自用/带客), 6 小时 (家属)
- 防篡改设计

### 数据保护
- Supabase Row Level Security (RLS)
- 环境变量保护敏感信息
- 单据照片自动清理 (2天后)

---

## 📁 项目结构

```
sfd6-shareholder-app/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 股东端首页
│   ├── login/                    # OTP 登录
│   ├── admin/                    # 管理后台
│   │   ├── page.tsx              # 管理首页
│   │   ├── shareholders/         # 股东管理
│   │   ├── redemptions/          # 核销记录
│   │   └── data-viewer/          # 数据查看器
│   ├── cashier/                  # 收银台
│   │   └── dashboard/            # 扫码核销
│   ├── api/                      # API 路由
│   │   ├── shareholders/         # 股东 API
│   │   ├── weekly-points/        # 每周积分 API
│   │   ├── redemptions/          # 核销 API
│   │   └── auth/                 # 认证 API
│   └── context/                  # React Context
│       └── ShareholderContext.tsx
├── components/                   # 可复用组件
│   ├── Header.tsx
│   ├── BottomNav.tsx
│   ├── StatCard.tsx
│   ├── Icon.tsx
│   ├── QRCodeDisplay.tsx
│   └── AuthGuard.tsx
├── lib/                          # 工具库
│   ├── supabase.ts               # Supabase 客户端
│   ├── utils.ts                  # 工具函数
│   └── qr-code.ts                # QR Code 处理
├── types/                        # TypeScript 类型
│   └── index.ts
├── sql/                          # 数据库脚本
│   ├── shareholders.sql
│   ├── weekly_points.sql
│   └── otp_auth.sql
├── scripts/                      # 工具脚本
│   ├── export-data.ts            # 数据导出
│   └── seed-data.sql             # 示例数据
├── public/                       # 静态资源
└── docs/                         # 文档
    ├── whatsapp-api-setup.md
    └── DATA_OVERVIEW.md
```

---

## 🚀 部署状态

### 已完成
- ✅ 项目架构搭建
- ✅ 数据库表结构设计
- ✅ 股东端核心功能
- ✅ 收银台扫码核销
- ✅ 管理后台基础功能
- ✅ Twilio WhatsApp 配置
- ✅ Supabase 配置
- ✅ Vercel 项目创建

### 待完成
- ⏳ 最终 Vercel 部署
- ⏳ 生产环境测试
- ⏳ WhatsApp OTP 测试
- ⏳ 自定义域名配置 (可选)

---

## 🔧 环境变量

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ffgfzvnoyyvfmhuorzcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT
JWT_SECRET=your-jwt-secret
QR_SECRET_KEY=your-qr-secret-key

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+your-twilio-number

# ⚠️ 注意: 实际密钥请查看 .env.local 或 Vercel 环境变量配置
```

---

## 📱 访问地址

### 开发环境
```
http://localhost:3000
```

### 生产环境 (Vercel)
```
股东端:    https://sfd6-shareholder-app.vercel.app
管理后台:  https://sfd6-shareholder-app.vercel.app/admin/login
收银台:    https://sfd6-shareholder-app.vercel.app/cashier/dashboard
数据查看:  https://sfd6-shareholder-app.vercel.app/admin/data-viewer
```

---

## 👥 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 收银员 | cashier | cashier123 |

---

## 📝 待办清单

### 高优先级
- [ ] 完成 Vercel 部署
- [ ] 测试股东端登录
- [ ] 测试 WhatsApp OTP
- [ ] 测试管理后台

### 中优先级
- [ ] 配置自定义域名
- [ ] 完整功能测试
- [ ] 用户培训文档

### 低优先级
- [ ] 数据分析仪表板
- [ ] 自动化测试
- [ ] 性能优化

---

## 📞 技术支持

如有问题，请联系开发团队。

---

*项目创建: 2026-06-12*  
*最后更新: 2026-06-21*
