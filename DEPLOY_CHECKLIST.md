# SFD6 Shareholder App - Vercel 部署检查清单

## 部署前准备

### 1. 确认代码已推送
- [x] 代码已推送到 GitHub: `https://github.com/DSSB2919/sfd6-shareholder-app`
- [x] `.gitignore` 已配置，排除 node_modules 和构建文件
- [x] `next.config.js` 已更新（移除静态导出，支持 Serverless）
- [x] `vercel.json` 已创建

### 2. 准备 Supabase 数据库
- [ ] 登录 Supabase Dashboard: https://supabase.com
- [ ] 确认项目: `ffgfzvnoyyvfmhuorzcw` (或创建新项目)
- [ ] 执行 SQL 初始化脚本:
  ```sql
  -- 在 SQL Editor 中依次执行以下文件:
  -- 1. sql/shareholders.sql
  -- 2. sql/weekly_points.sql
  -- 3. sql/otp_auth.sql
  -- 4. sql/redemptions.sql (如果有)
  ```
- [ ] 确认 Storage Bucket `receipts` 已创建
- [ ] 获取 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. 注册 360dialog (WhatsApp API)
- [ ] 访问 https://360dialog.com 注册账号
- [ ] 完成 Facebook Business 验证
- [ ] 创建消息模板 `otp_verification`:
  ```
  Your SFD6 Shareholder App verification code is: {{1}}
  
  This code will expire in 5 minutes.
  Do not share this code with anyone.
  ```
- [ ] 获取 API Key

---

## Vercel 部署步骤

### 1. 导入项目
1. 登录 https://vercel.com
2. 点击 "Add New Project"
3. 导入 GitHub 仓库: `DSSB2919/sfd6-shareholder-app`
4. 框架预设选择: **Next.js**
5. 点击 **Deploy** (先不配置环境变量，会失败，但创建项目)

### 2. 配置环境变量
在项目设置中添加以下环境变量:

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 生产环境 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ffgfzvnoyyvfmhuorzcw.supabase.co` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Supabase Anon Key |
| `JWT_SECRET` | (生成) | JWT 签名密钥 |
| `QR_SECRET_KEY` | (生成) | QR Code 密钥 |
| `WHATSAPP_API_KEY` | (从360dialog获取) | WhatsApp API Key |

生成密钥命令:
```bash
openssl rand -base64 32
```

### 3. 重新部署
- 配置完环境变量后，Vercel 会自动重新部署
- 或手动点击 "Redeploy"

### 4. 配置自定义域名 (可选)
1. Project Settings → Domains
2. 添加域名，如: `sfd6.dominant.my`
3. 按提示配置 DNS 记录

---

## 部署后验证

### 基础功能测试
- [ ] 首页正常加载: `https://your-domain.com/`
- [ ] 登录页面: `https://your-domain.com/login/`
- [ ] 管理后台: `https://your-domain.com/admin/login/`

### 股东端功能
- [ ] OTP 登录功能正常
- [ ] 股东信息展示正确
- [ ] Weekly Points 显示正确
- [ ] QR Code 生成正常
- [ ] 积分计算器可用

### 管理后台功能
- [ ] 管理员登录正常
- [ ] 股东列表加载
- [ ] 添加/编辑股东
- [ ] 核销记录查看

### WhatsApp 测试
- [ ] 使用真实手机号测试 OTP 接收
- [ ] 确认验证码 5 分钟过期

---

## 生产环境注意事项

### 安全
1. **立即修改默认密码**
   - 登录管理后台后修改 admin 密码
   
2. **定期轮换密钥**
   - JWT_SECRET
   - QR_SECRET_KEY
   - WHATSAPP_API_KEY

3. **启用 HTTPS**
   - Vercel 默认启用，无需额外配置

### 监控
1. **Vercel Analytics**
   - 在 Dashboard 启用

2. **Supabase 监控**
   - 关注数据库连接数
   - 监控 Storage 使用量

3. **错误追踪** (可选)
   - 集成 Sentry: https://sentry.io

---

## 故障排除

### 构建失败
```
检查 Vercel Build Logs
常见原因:
- 缺少环境变量
- TypeScript 类型错误
- 依赖安装失败
```

### API 404
```
确认 next.config.js 中没有 output: 'export'
Vercel Serverless 需要动态路由支持
```

### 数据库连接失败
```
检查:
1. Supabase URL 是否正确
2. Anon Key 是否有效
3. Supabase 是否允许外部连接 (Database → Settings → Network)
```

### WhatsApp 发送失败
```
检查:
1. WHATSAPP_API_KEY 是否正确
2. 模板是否已审核通过
3. 手机号格式是否正确 (+60XXXXXXXXX)
```

---

## 紧急联系

- **Vercel 支持**: https://vercel.com/help
- **Supabase 文档**: https://supabase.com/docs
- **360dialog 文档**: https://docs.360dialog.com/

---

**部署日期**: ___________
**部署人员**: ___________
**域名**: ___________
