# SFD6 Shareholder Lifestyle App

Snowy Fox District Six Entertainment 股东专属应用

## 功能模块

### 股东端
- 📱 OTP登录（WhatsApp）
- 💳 股权信息展示
- 🧮 积分抵扣计算器
- 🎁 股东权益展示
- 👥 带客奖励计算
- 🎫 副卡二维码生成
- ✅ **Weekly Points 实时状态** - 显示本周积分可用/已用状态

### Cashier端
- 📷 扫码核销
- 🧾 核销记录查询
- 📊 日报表导出
- ✅ **自动标记积分使用** - 核销后自动更新股东积分状态

### 管理后台
- 👤 股东管理（添加/编辑）
- 🎫 副卡管理

## 技术栈

- Next.js 14 + TypeScript
- Tailwind CSS
- Framer Motion
- Supabase (PostgreSQL + Storage)
- JWT认证

## 数据库表结构

### weekly_points_usage
记录每位股东每周积分使用状态
- `shareholder_id` - 股东ID
- `year` - ISO年份
- `week_number` - ISO周数(1-53)
- `used` - 本周是否已使用
- `used_at` - 使用时间
- `redemption_id` - 关联核销记录

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:init

# 开发模式
npm run dev

# 构建
npm run build
```

## 环境变量

```env
JWT_SECRET=your-secret-key
WHATSAPP_API_KEY=your-whatsapp-api-key
```

## 默认账号

- Cashier: `cashier` / `cashier123`

## 配色方案

- 主背景: `#09090b` (zinc-950)
- 强调色: `#10b981` (emerald-400)
- 次强调: `#fcd34d` (amber-300)