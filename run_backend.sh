#!/bin/bash

echo "🚀 使用 screen 启动 EchoCast 后端服务..."

# 检查 screen 是否安装
if ! command -v screen &> /dev/null; then
    echo "📦 安装 screen..."
    sudo yum install -y screen || sudo apt-get install -y screen
fi

# 停止已存在的 screen 会话
screen -S echocast -X quit 2>/dev/null

# 创建新的 screen 会话并运行服务
cd /root/usr/podcast_web/backend
screen -dmS echocast bash -c "uvicorn app.main:app --host 0.0.0.0 --port 18188"

sleep 2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 服务已在后台启动！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 管理命令："
echo "  查看会话: screen -ls"
echo "  进入会话: screen -r echocast"
echo "  退出会话: 在会话中按 Ctrl+A 然后按 D"
echo "  停止服务: screen -S echocast -X quit"
echo ""
echo "🌐 API 地址: http://localhost:18188"
echo "📖 API 文档: http://localhost:18188/docs"
echo ""

