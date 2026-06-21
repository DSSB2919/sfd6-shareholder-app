# Vercel 部署指南

由于本地环境限制，请按照以下步骤手动完成部署。

## 方案一：通过 Vercel Dashboard 部署（推荐）

### 步骤 1：访问 Vercel Dashboard
1. 打开浏览器访问 https://vercel.com/dashboard
2. 使用 GitHub 账号登录 (DSSB2919)

### 步骤 2：导入项目
1. 点击 "Add New Project"
2. 选择 "Import Git Repository"
3. 找到 `sfd6-shareholder-app` 项目
4. 点击 "Import"

### 步骤 3：配置环境变量
在部署配置页面，添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://ffgfzvnoyyvfmhuorzcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2Z6dm5veXl2Zm1odW9yemN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzA5OTAsImV4cCI6MjA5NjkwNjk5MH0.8JyBqa2HGiOrF2CxsPJYuM_rdXcUlxFGD_aHqluOwTE
JWT_SECRET=vhYedCQhbmopgH4nCy3x3tE3DQZpb6nprSL02yM3PQY=
QR_SECRET_KEY=Wk5oRX/Drm+dCzLOAfjjf2Rp0ZJ10snBg1ftoY4NBeI=
TWILIO_ACCOUNT_SID=ACb617573b4b2f8744d8642db6218a825d
TWILIO_AUTH_TOKEN=2d647bcb76cebf677ff9b211beab6037
TWILIO_WHATSAPP_NUMBER=whatsapp:+19087086790
```

### 步骤 4：部署
1. 点击 "Deploy"
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后，会获得域名如：`https://sfd6-shareholder-app.vercel.app`

---

## 方案二：使用 Vercel CLI（需要 Node.js 环境）

### 前提条件
- 安装 Node.js 18+ https://nodejs.org/
- 安装 Vercel CLI: `npm install -g vercel`

### 部署步骤

```bash
# 1. 进入项目目录
cd /path/to/sfd6-shareholder-app

# 2. 安装依赖
npm install

# 3. 登录 Vercel
vercel login

# 4. 部署到生产环境
vercel --prod
```

CLI 会提示输入环境变量，或者你可以先创建 `.env.local` 文件：

```bash
# 创建环境变量文件
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://ffgfzvnoyyvfmhuorzcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2Z6dm5veXl2Zm1odW9yemN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzA5OTAsImV4cCI6MjA5NjkwNjk5MH0.8JyBqa2HGiOrF2CxsPJYuM_rdXcUlxFGD_aHqluOwTE
JWT_SECRET=vhYedCQhbmopgH4nCy3x3tE3DQZpb6nprSL02yM3PQY=
QR_SECRET_KEY=Wk5oRX/Drm+dCzLOAfjjf2Rp0ZJ10snBg1ftoY4NBeI=
TWILIO_ACCOUNT_SID=ACb617573b4b2f8744d8642db6218a825d
TWILIO_AUTH_TOKEN=2d647bcb76cebf677ff9b211beab6037
TWILIO_WHATSAPP_NUMBER=whatsapp:+19087086790
EOF

# 然后部署
vercel --prod
```

---

## 方案三：使用 GitHub Actions 自动部署

项目已配置 `.github/workflows/deploy.yml`，只需在 GitHub 仓库设置中添加 Secrets：

### 步骤 1：获取 Vercel Token
1. 访问 https://vercel.com/account/tokens
2. 创建新 Token
3. 复制 Token 值

### 步骤 2：获取项目信息
1. 在项目根目录运行:
```bash
vercel
```
2. 完成后，查看 `.vercel/project.json`:
```json
{
  "orgId": "your-org-id",
  "projectId": "your-project-id"
}
```

### 步骤 3：配置 GitHub Secrets
1. 访问 https://github.com/DSSB2919/sfd6-shareholder-app/settings/secrets/actions
2. 添加以下 Secrets:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | 从步骤1获取的 Token |
| `VERCEL_ORG_ID` | 从步骤2获取的 orgId |
| `VERCEL_PROJECT_ID` | 从步骤2获取的 projectId |
| `NEXT_PUBLIC_SUPABASE_URL` | https://ffgfzvnoyyvfmhuorzcw.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| `JWT_SECRET` | vhYedCQhbmopgH4nCy3x3tE3DQZpb6nprSL02yM3PQY= |
| `QR_SECRET_KEY` | Wk5oRX/Drm+dCzLOAfjjf2Rp0ZJ10snBg1ftoY4NBeI= |
| `TWILIO_ACCOUNT_SID` | ACb617573b4b2f8744d8642db6218a825d |
| `TWILIO_AUTH_TOKEN` | 2d647bcb76cebf677ff9b211beab6037 |
| `TWILIO_WHATSAPP_NUMBER` | whatsapp:+19087086790 |

### 步骤 4：触发部署
推送代码到 main 分支会自动触发部署：
```bash
git push origin main
```

---

## 部署后验证

### 1. 访问以下地址测试：
- 股东端: `https://your-domain.vercel.app`
- 管理后台: `https://your-domain.vercel.app/admin/login`
- 收银台: `https://your-domain.vercel.app/cashier/dashboard`
- 数据查看: `https://your-domain.vercel.app/admin/data-viewer`

### 2. 测试登录
- 管理员: `admin` / `admin123`
- 收银员: `cashier` / `cashier123`

### 3. 测试 OTP
- 使用股东手机号测试 WhatsApp OTP 发送

---

## 故障排除

### 构建失败
检查 Vercel 部署日志，常见问题：
- 环境变量缺失
- 依赖安装失败
- TypeScript 类型错误

### 运行时错误
- 检查 Supabase 连接
- 验证环境变量是否正确设置
- 查看 Vercel Functions 日志

### 自定义域名
1. 在 Vercel Dashboard 选择项目
2. 点击 "Settings" → "Domains"
3. 添加域名（如 `sfd6.dominant.my`）
4. 按照提示配置 DNS

---

## 联系方式

部署遇到问题？联系开发团队获取支持。
