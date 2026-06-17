# SFD6 Shareholder App - Vercel 部署指南

## 前置要求

1. **Vercel 账号** - https://vercel.com
2. **GitHub 账号** - 代码仓库
3. **Supabase 账号** - 数据库
4. **WhatsApp BSP 账号** (可选) - 360dialog

## 部署步骤

### 1. 准备环境变量

在 Vercel Dashboard 添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-random-secret-min-32-chars
WHATSAPP_API_KEY=your-360dialog-key (可选)
```

### 2. 数据库初始化

在 Supabase SQL Editor 执行以下文件：

1. `sql/shareholders.sql` - 股东表
2. `sql/weekly_points.sql` - 每周积分表
3. `sql/otp_auth.sql` - OTP 验证码表

### 3. 部署到 Vercel

#### 方式 A: GitHub 集成 (推荐)

1. 推送代码到 GitHub
2. 登录 Vercel → New Project
3. 导入 GitHub 仓库
4. 配置环境变量
5. 点击 Deploy

#### 方式 B: Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 4. 配置域名 (可选)

1. Vercel Dashboard → Project Settings → Domains
2. 添加自定义域名
3. 配置 DNS 记录

## 部署后检查清单

- [ ] 首页能正常加载
- [ ] OTP 登录功能正常
- [ ] Weekly Points 显示正确
- [ ] QR Code 能正常生成
- [ ] Cashier 端能正常访问

## 故障排除

### 构建失败

检查 `next.config.js` 配置：
```javascript
output: 'export',  // 静态导出
distDir: 'dist',   // 输出目录
```

### API 404

Vercel 静态导出不支持 API Routes。如果需要 API，需要：
1. 改用 Serverless 部署 (移除 `output: 'export'`)
2. 或使用 Vercel Functions

### 数据库连接失败

检查 Supabase 配置：
- URL 是否正确
- Anon Key 是否有效
- 数据库是否允许外部连接

## 生产环境注意事项

1. **安全**
   - 使用强 JWT_SECRET
   - 启用 HTTPS
   - 定期轮换 API Keys

2. **性能**
   - 启用 Vercel Edge Network
   - 配置图片优化
   - 使用 CDN

3. **监控**
   - 配置 Vercel Analytics
   - 设置错误监控 (Sentry)
   - 数据库性能监控

## 更新部署

```bash
# 推送代码到 main 分支
 git push origin main

# Vercel 会自动重新部署
```

## 回滚

Vercel Dashboard → Deployments → 选择旧版本 → Promote to Production

---

## 支持

- Vercel 文档: https://vercel.com/docs
- Next.js 部署: https://nextjs.org/docs/deployment
