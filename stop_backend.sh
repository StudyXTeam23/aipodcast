#!/bin/bash

echo "🛑 停止 EchoCast 服务..."

# 方式1: 停止 screen 会话
screen -S echocast -X quit 2>/dev/null && echo "✅ Screen 会话已停止"

# 方式2: 停止 systemd 服务（新版本）
sudo systemctl stop echocast-backend 2>/dev/null && echo "✅ 后端服务已停止"
sudo systemctl stop echocast-frontend 2>/dev/null && echo "✅ 前端服务已停止"

# 方式3: 停止 systemd 服务（旧版本兼容）
sudo systemctl stop echocast 2>/dev/null && echo "✅ 旧版服务已停止"

# 方式4: 杀掉进程
pkill -f "uvicorn app.main:app" 2>/dev/null && echo "✅ Uvicorn 进程已停止"
pkill -f "npm run dev" 2>/dev/null && echo "✅ 前端进程已停止"

echo ""
echo "✅ 所有服务已停止"

