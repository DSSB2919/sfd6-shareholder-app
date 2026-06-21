# SFD6 Shareholder App - 数据存储总览

## 📊 数据库表结构

### 1. shareholders (股东表)
存储所有股东的基本信息和账户数据

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键，自增ID |
| member_no | VARCHAR(50) | 股东编号，如 SFD6-FP-001 |
| name | VARCHAR(255) | 股东姓名 |
| phone | VARCHAR(20) | 手机号 |
| email | VARCHAR(255) | 邮箱 |
| share_percent | INTEGER | 股权百分比 (1/3/5/10/20+) |
| actual_investment_rm | INTEGER | 实际投资额(RM) |
| points_balance | INTEGER | 当前积分余额 (Snow Points) |
| tier | VARCHAR(50) | 股东等级 |
| weekly_points | INTEGER | 每周可用积分额度 |
| referral_code | VARCHAR(50) | 推荐码 |
| password_hash | VARCHAR(255) | 登录密码 |
| is_active | BOOLEAN | 是否激活 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**股东等级规则：**
- Founding Partner: 20%+ → 每周 300 分
- Core Shareholder: 10% → 每周 150 分
- Strategic Shareholder: 5% → 每周 80 分
- Lifestyle Shareholder: 3% → 每周 50 分
- Support Shareholder: 1% → 每周 30 分

**会员编号规则：**
- FP = Founding Partner
- CR = Core Shareholder
- ST = Strategic Shareholder
- LS = Lifestyle Shareholder
- SU = Support Shareholder

---

### 2. weekly_points_usage (每周积分使用记录表)
记录每位股东每周的积分使用状态

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| shareholder_id | INTEGER | 股东ID (外键) |
| year | INTEGER | ISO年份 |
| week_number | INTEGER | ISO周数 (1-53) |
| used | BOOLEAN | 本周是否已使用 |
| used_at | TIMESTAMP | 使用时间 |
| redemption_id | INTEGER | 关联的核销记录ID |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**唯一约束：** (shareholder_id, year, week_number)

---

### 3. redemptions (核销记录表)
存储所有消费核销记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| shareholder_id | INTEGER | 股东ID |
| shareholder_name | VARCHAR(255) | 股东姓名 |
| shareholder_member_no | VARCHAR(50) | 股东编号 |
| food_amount | DECIMAL | 食物消费金额 |
| alcohol_amount | DECIMAL | 酒精消费金额 |
| total_deduct | INTEGER | 总抵扣积分 |
| final_pay | DECIMAL | 实付金额 |
| receipt_url | VARCHAR(500) | 单据图片URL |
| receipt_path | VARCHAR(500) | 单据存储路径 |
| status | VARCHAR(20) | 状态: pending/verified/rejected |
| created_at | TIMESTAMP | 创建时间 |
| verified_at | TIMESTAMP | 核销时间 |
| verified_by | VARCHAR(100) | 核销人 |

---

### 4. family_cards (家属副卡表)
存储股东的家属副卡信息

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| shareholder_id | INTEGER | 股东ID (外键) |
| card_number | VARCHAR(50) | 副卡编号 |
| name | VARCHAR(255) | 家属姓名 |
| relationship | VARCHAR(20) | 关系: spouse/child |
| qr_code | TEXT | 二维码数据 |
| qr_expires_at | TIMESTAMP | 二维码过期时间 |
| is_active | BOOLEAN | 是否激活 |

---

### 5. cashiers (收银员表)
存储收银员/管理员账户

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| username | VARCHAR(100) | 用户名 |
| name | VARCHAR(255) | 姓名 |
| password_hash | VARCHAR(255) | 密码 |
| is_admin | BOOLEAN | 是否管理员 |
| is_active | BOOLEAN | 是否激活 |

---

## 🔌 API 路由

### 股东端 API

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/shareholder` | GET | 获取当前登录股东信息 |
| `/api/shareholder/password` | PUT | 修改密码 |

### 管理后台 API

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/shareholders` | GET | 获取所有股东列表 |
| `/api/shareholders` | POST | 创建新股东 |
| `/api/admin/shareholders` | GET | 获取股东详情（管理用） |
| `/api/admin/shareholders/[id]` | PUT | 更新股东信息 |
| `/api/admin/shareholders/[id]` | DELETE | 删除股东 |

### 每周积分 API

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/weekly-points` | GET | 获取本周积分状态 |
| `/api/weekly-points` | POST | 标记本周积分已使用 |

### 核销 API

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/redemptions` | GET | 获取核销记录列表 |
| `/api/redemptions` | POST | 创建核销记录 |
| `/api/redemptions/[id]` | PUT | 更新核销状态 |
| `/api/redemptions/[id]` | DELETE | 删除核销记录 |

### 认证 API

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/auth/otp` | POST | 发送 OTP 验证码 |
| `/api/auth/otp/verify` | POST | 验证 OTP 并登录 |
| `/api/auth/cashier` | POST | 收银员登录 |

---

## 💾 本地存储 (localStorage)

### 股东端存储的数据

| Key | 内容 | 说明 |
|-----|------|------|
| `token` | JWT Token | 登录凭证 |
| `shareholder` | Shareholder 对象 | 股东信息缓存 |
| `points_calculator_food` | Number | 积分计算器-食物金额 |
| `points_calculator_alcohol` | Number | 积分计算器-酒精金额 |

---

## 📱 页面路由

### 股东端
- `/` - 首页（股权信息、Weekly Points 状态）
- `/login` - OTP 登录页
- `/points` - 积分计算器
- `/benefits` - 股东权益展示
- `/referral` - 带客奖励
- `/settings` - 设置（修改密码、退出登录）

### 收银台
- `/cashier-login` - 收银员登录
- `/cashier/dashboard` - 扫码核销

### 管理后台
- `/admin/login` - 管理员登录
- `/admin` - 管理后台首页
- `/admin/shareholders` - 股东管理
- `/admin/redemptions` - 核销记录

---

## 🔐 安全与认证

### JWT Token 结构
- 包含: shareholder_id, member_no, tier, exp
- 有效期: 24 小时
- 存储: localStorage

### QR Code 结构
- 类型: self (自用) / family (家属) / referral (带客)
- 有效期: 5 分钟 (自用/带客), 6 小时 (家属)
- 加密: HMAC-SHA256 签名

### 密码规则
- 最小长度: 6 位
- 默认密码: 123456 (部署后应立即修改)

---

## 📊 积分计算规则

### 每周积分额度
| 等级 | 每周额度 |
|------|----------|
| Founding Partner (20%+) | 300 分 |
| Core Shareholder (10%) | 150 分 |
| Strategic Shareholder (5%) | 80 分 |
| Lifestyle Shareholder (3%) | 50 分 |
| Support Shareholder (1%) | 30 分 |

### 消费抵扣规则 (每 RM100)
| 等级 | 食物抵扣 | 酒精抵扣 |
|------|----------|----------|
| Founding Partner | 25 分 | 10 分 |
| Core Shareholder | 20 分 | 8 分 |
| Strategic Shareholder | 15 分 | 5 分 |
| Lifestyle Shareholder | 12 分 | 4 分 |
| Support Shareholder | 10 分 | 3 分 |

### 带客奖励比例
| 等级 | 食物奖励 | 酒精奖励 |
|------|----------|----------|
| Founding Partner | 10% | 4% |
| Core Shareholder | 8% | 3% |
| Strategic Shareholder | 8% | 3% |
| Lifestyle Shareholder | 6% | 2.5% |
| Support Shareholder | 5% | 2% |

---

## ☁️ Supabase 配置

### 项目信息
- **URL**: https://ffgfzvnoyyvfmhuorzcw.supabase.co
- **Region**: Southeast Asia (Singapore)

### Storage Buckets
- `receipts` - 存储核销单据照片

### 环境变量
```env
NEXT_PUBLIC_SUPABASE_URL=https://ffgfzvnoyyvfmhuorzcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-jwt-secret
QR_SECRET_KEY=your-qr-secret-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+your-twilio-number
```

> ⚠️ **注意**: 实际密钥请查看 `.env.local` 或 Vercel 环境变量配置

---

## 🚀 部署信息

### Vercel 项目
- **项目名称**: sfd6-shareholder-app
- **域名**: https://sfd6-shareholder-app.vercel.app

### 访问地址
- 股东端: https://sfd6-shareholder-app.vercel.app
- 管理后台: https://sfd6-shareholder-app.vercel.app/admin/login
- 收银台: https://sfd6-shareholder-app.vercel.app/cashier/dashboard

### 默认账号
- 管理员: admin / admin123
- 收银员: cashier / cashier123

---

## 📝 待办事项

### 高优先级
- [ ] 完成 Vercel 部署
- [ ] 测试股东端登录功能
- [ ] 测试 WhatsApp OTP 发送
- [ ] 测试管理后台功能

### 中优先级
- [ ] 配置自定义域名 (如 sfd6.dominant.my)
- [ ] 股东端完整功能测试
- [ ] 管理层端测试
- [ ] 收银台扫码测试

---

*最后更新: 2026-06-21*
