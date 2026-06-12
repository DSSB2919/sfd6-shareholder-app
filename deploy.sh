#!/bin/bash

# SFD6 Shareholder App - Vercel Deployment Script
# Usage: ./deploy.sh YOUR_GITHUB_USERNAME

set -e

GITHUB_USERNAME=$1

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ 错误: 请提供GitHub用户名"
    echo "用法: ./deploy.sh your-github-username"
    exit 1
fi

echo "🚀 SFD6 Shareholder App 部署脚本"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 初始化Git仓库..."
    git init
fi

# Configure git if not already done
if ! git config --global user.email > /dev/null 2>&1; then
    echo "⚙️  配置Git用户信息..."
    git config user.email "deploy@sfd6.local"
    git config user.name "SFD6 Deploy"
fi

echo "📁 添加文件到Git..."
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "✅ 没有需要提交的更改"
else
    echo "💾 提交更改..."
    git commit -m "Deploy: SFD6 Shareholder App - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "🔄 更新远程仓库地址..."
    git remote set-url origin "https://github.com/${GITHUB_USERNAME}/sfd6-shareholder-app.git"
else
    echo "🔗 添加远程仓库..."
    git remote add origin "https://github.com/${GITHUB_USERNAME}/sfd6-shareholder-app.git"
fi

echo ""
echo "📤 推送到GitHub..."
echo "   仓库: https://github.com/${GITHUB_USERNAME}/sfd6-shareholder-app"
echo ""

# Try to push
if git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null; then
    echo "✅ 代码已推送到GitHub!"
else
    echo "⚠️  推送失败，可能原因:"
    echo "   1. GitHub仓库不存在"
    echo "   2. 需要登录认证"
    echo ""
    echo "🔧 请按以下步骤操作:"
    echo "   1. 访问 https://github.com/new"
    echo "   2. 创建名为 'sfd6-shareholder-app' 的仓库"
    echo "   3. 重新运行此脚本"
    echo ""
    exit 1
fi

echo ""
echo "🌐 下一步: Vercel部署"
echo "==================="
echo ""
echo "1. 访问 https://vercel.com/new"
echo "2. 导入 'sfd6-shareholder-app' 仓库"
echo "3. 点击 Deploy"
echo ""
echo "📱 应用入口:"
echo "   股东端: https://your-app.vercel.app/login"
echo "   Cashier: https://your-app.vercel.app/cashier-login"
echo "   管理后台: https://your-app.vercel.app/admin/shareholders"
echo ""
echo "✨ 部署完成!"
