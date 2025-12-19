#!/bin/bash

echo "🚀 配置 GitHub Actions 自动编译 Windows .exe"
echo ""

# 1. 检查是否在 git 仓库中
if [ ! -d .git ]; then
    echo "❌ 错误：当前目录不是 git 仓库"
    echo "请先运行: git init"
    exit 1
fi

# 2. 检查 remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo "⚙️  配置 GitHub remote..."
    git remote add origin https://github.com/yuanzhhh/my-lottery-app.git
    echo "✅ Remote 已配置"
else
    echo "✅ Remote 已存在: $REMOTE_URL"
fi

# 3. 确保在 main 分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚙️  切换到 main 分支..."
    git branch -M main
fi

# 4. 创建 workflow 目录
echo "📁 创建 .github/workflows 目录..."
mkdir -p .github/workflows

# 5. 创建 workflow 配置文件
echo "📝 创建 GitHub Actions 配置..."
cat > .github/workflows/build-windows.yml << 'EOF'
name: Build Windows App

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-windows:
    runs-on: windows-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install pake-cli
        run: pnpm install -g pake-cli
      
      - name: Build Windows Application
        run: pake ./index.html --name "抽奖"
      
      - name: Find generated files
        shell: pwsh
        run: |
          Write-Host "Looking for generated files..."
          Get-ChildItem -Recurse -Include *.exe, *.msi | ForEach-Object { Write-Host $_.FullName }
      
      - name: Upload Windows Executable
        uses: actions/upload-artifact@v3
        with:
          name: windows-app
          path: |
            **/*.exe
            **/*.msi
          if-no-files-found: error

  build-macos:
    runs-on: macos-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install pake-cli
        run: pnpm install -g pake-cli
      
      - name: Build macOS Application
        run: pake ./index.html --name "抽奖"
      
      - name: Upload macOS App
        uses: actions/upload-artifact@v3
        with:
          name: macos-app
          path: |
            **/*.dmg
            **/*.app
EOF

echo "✅ Workflow 配置文件已创建"

# 6. 添加所有文件
echo "📦 添加文件到 Git..."
git add .

# 7. 提交
echo "💾 提交更改..."
git commit -m "Add GitHub Actions workflow for Windows build" || echo "⚠️  没有新的更改需要提交"

# 8. 推送到 GitHub
echo "🚀 推送到 GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ============================================"
    echo "✅ 配置成功！GitHub Actions 已启动编译"
    echo "✅ ============================================"
    echo ""
    echo "📝 下一步："
    echo "1. 打开浏览器查看编译进度："
    echo "   https://github.com/yuanzhhh/my-lottery-app/actions"
    echo ""
    echo "2. 等待 5-10 分钟编译完成"
    echo ""
    echo "3. 下载 windows-app.zip"
    echo ""
    echo "🌐 正在打开 Actions 页面..."
    sleep 2
    open https://github.com/yuanzhhh/my-lottery-app/actions 2>/dev/null || echo "请手动打开: https://github.com/yuanzhhh/my-lottery-app/actions"
else
    echo ""
    echo "❌ 推送失败，可能需要先拉取远程更改："
    echo "git pull origin main --rebase"
    echo "然后重新运行此脚本"
fi
