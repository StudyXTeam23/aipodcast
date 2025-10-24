#!/bin/bash

echo "🚀 部署 EchoCast 服务（后端 + 前端）..."
echo ""

# ============================================
# 后端服务部署
# ============================================
echo "📦 [1/2] 部署后端服务..."

cd /root/usr/podcast_web/backend
if [ ! -d "venv" ]; then
    echo "  创建虚拟环境..."
    python3 -m venv venv
fi

echo "  安装/更新依赖..."
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

UVICORN_PATH=$(which uvicorn)
echo "  ✓ Uvicorn 路径: $UVICORN_PATH"

# 创建后端 systemd 服务文件
echo "  创建后端 systemd 服务..."
sudo tee /etc/systemd/system/echocast-backend.service > /dev/null << EOF
[Unit]
Description=EchoCast Backend API Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/usr/podcast_web/backend
Environment="PATH=$PATH:/root/usr/podcast_web/backend/venv/bin"
ExecStart=/root/usr/podcast_web/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 18188
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "  ✓ 后端服务配置完成"
echo ""

# ============================================
# 前端服务部署
# ============================================
echo "📦 [2/2] 部署前端服务..."

cd /root/usr/podcast_web/frontend

# 检查并安装 node_modules
if [ ! -d "node_modules" ]; then
    echo "  安装前端依赖..."
    npm install
else
    echo "  ✓ 前端依赖已存在"
fi

# 找到 npm 的实际路径
NPM_PATH=$(which npm)
NODE_PATH=$(which node)
NVM_DIR=$(dirname $(dirname $NPM_PATH))

echo "  ✓ Node 路径: $NODE_PATH"
echo "  ✓ NPM 路径: $NPM_PATH"

# 创建前端 systemd 服务文件
echo "  创建前端 systemd 服务..."
sudo tee /etc/systemd/system/echocast-frontend.service > /dev/null << EOF
[Unit]
Description=EchoCast Frontend Dev Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/usr/podcast_web/frontend
Environment="PATH=$NVM_DIR/bin:/usr/local/bin:/usr/bin:/bin"
Environment="NODE_ENV=development"
ExecStart=$NPM_PATH run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "  ✓ 前端服务配置完成"
echo ""

# ============================================
# 启动所有服务
# ============================================
echo "🔄 重载 systemd 配置..."
sudo systemctl daemon-reload

echo "🟢 启动后端服务..."
sudo systemctl restart echocast-backend
sudo systemctl enable echocast-backend

echo "🟢 启动前端服务..."
sudo systemctl restart echocast-frontend
sudo systemctl enable echocast-frontend

# 等待服务启动
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 后端服务管理："
echo "  状态: sudo systemctl status echocast-backend"
echo "  日志: sudo journalctl -u echocast-backend -f"
echo "  停止: sudo systemctl stop echocast-backend"
echo "  重启: sudo systemctl restart echocast-backend"
echo ""
echo "📋 前端服务管理："
echo "  状态: sudo systemctl status echocast-frontend"
echo "  日志: sudo journalctl -u echocast-frontend -f"
echo "  停止: sudo systemctl stop echocast-frontend"
echo "  重启: sudo systemctl restart echocast-frontend"
echo ""
echo "📋 停止所有服务："
echo "  sudo systemctl stop echocast-backend echocast-frontend"
echo ""
echo "🌐 访问地址: http://$(curl -s ifconfig.me):3003"
echo "📖 API 文档: http://$(curl -s ifconfig.me):18188/docs"
echo ""

# 显示服务状态
echo "后端状态："
sudo systemctl status echocast-backend --no-pager | head -10
echo ""
echo "前端状态："
sudo systemctl status echocast-frontend --no-pager | head -10

