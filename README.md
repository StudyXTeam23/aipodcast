# EchoCast - AI播客平台

一个基于 AI 的智能播客生成和管理平台，可以将文本、文档等内容转换为高质量的播客音频。

## 功能特性

- 📝 多格式文件上传支持（文本、PDF、音频、视频等）
- 🤖 AI 驱动的内容分析和播客脚本生成
- 🎙️ 高质量语音合成（使用 ElevenLabs）
- 📚 播客库管理和播放
- 🔍 智能搜索和过滤
- 💾 云端存储（AWS S3）

## 技术栈

### 后端
- **框架**: FastAPI
- **AI 服务**: Google Gemini API
- **语音合成**: ElevenLabs API
- **存储**: AWS S3
- **语言**: Python 3.9+

### 前端
- **框架**: React
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router

## 快速开始

### 环境配置

1. 克隆仓库
```bash
git clone https://github.com/kimiguo1109/aipodcast.git
cd aipodcast
```

2. 配置环境变量

在项目根目录创建 `.env` 文件，参考以下配置：

```env
# AWS S3 配置
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_S3_BUCKET=your_s3_bucket_name
AWS_REGION=us-east-1

# ElevenLabs API 配置
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Gemini API 配置
GEMINI_API_KEY=your_gemini_api_key_here
```

### 后端设置

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 18188
```

### 前端设置

```bash
cd frontend
npm install

# 复制环境变量文件（如需修改 API 地址）
cp .env.example .env.local

npm run dev
```

前端将在 `http://localhost:3003` 运行，后端 API 在 `http://localhost:18188`

> **注意**：前端默认会连接到 `http://localhost:18188` 的后端 API。如果您的后端部署在其他地址，请修改 `frontend/.env.production` 文件中的 `VITE_API_BASE_URL`

## 部署指南

### 推荐方式：一键部署（Systemd 服务）

**优点**：开机自启、自动重启、日志管理、前后端同时部署、网络中断后自动恢复

```bash
# 一键部署（前端 + 后端）
./deploy.sh

# 后端服务管理
sudo systemctl status echocast-backend     # 查看后端状态
sudo systemctl restart echocast-backend    # 重启后端
sudo journalctl -u echocast-backend -f     # 查看后端日志

# 前端服务管理
sudo systemctl status echocast-frontend    # 查看前端状态
sudo systemctl restart echocast-frontend   # 重启前端
sudo journalctl -u echocast-frontend -f    # 查看前端日志

# 停止所有服务
./stop_backend.sh
# 或
sudo systemctl stop echocast-backend echocast-frontend
```

### 其他运行方式

#### 🟡 方案 2：Screen 会话（临时开发）

**优点**：简单快速、可随时查看

```bash
# 仅启动后端（临时）
./run_backend.sh

# 查看运行中的会话
screen -ls

# 进入会话（查看日志）
screen -r echocast

# 退出会话（保持运行）
Ctrl+A, 然后按 D

# 停止服务
./stop_backend.sh
```

**注意**：此方式仅启动后端，前端需手动启动：`cd frontend && npm run dev`

#### 🟡 方案 3：直接运行（临时测试）

```bash
# 后端
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 18188 --reload

# 前端（另开终端）
cd frontend
npm run dev
```

**注意**：退出终端后服务会停止

### 防火墙设置

确保 EC2 安全组开放以下端口：
- `18188` - 后端 API
- `3003` - 前端开发服务器

```bash
# 检查端口监听状态
sudo netstat -tlnp | grep -E "18188|3003"
```

## 项目结构

```
aipodcast/
├── backend/              # FastAPI 后端
│   ├── app/
│   │   ├── api/         # API 路由
│   │   ├── services/    # 业务逻辑
│   │   ├── tasks/       # 异步任务
│   │   └── utils/       # 工具函数
│   └── tests/           # 测试文件
├── frontend/            # React 前端
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── pages/       # 页面组件
│   │   └── services/    # API 服务
│   └── public/          # 静态资源
└── stitch_echocast_landing_page/  # 着陆页设计

```

## API 文档

启动后端服务后，访问以下地址查看 API 文档：
- Swagger UI: `http://localhost:18188/docs`
- ReDoc: `http://localhost:18188/redoc`

## 环境变量说明

### 后端环境变量（`.env`）
- `AWS_ACCESS_KEY_ID` - AWS 访问密钥
- `AWS_SECRET_ACCESS_KEY` - AWS 密钥
- `ELEVENLABS_API_KEY` - ElevenLabs API 密钥
- `GEMINI_API_KEY` - Google Gemini API 密钥
- `API_PORT` - 后端服务端口（默认 18188）

### 前端环境变量
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `VITE_API_BASE_URL` - 后端 API 地址

## 安全说明

⚠️ **重要**: 
- 请勿将 API 密钥和敏感信息提交到代码仓库
- 使用 `.env` 文件管理环境变量
- `.env` 文件已在 `.gitignore` 中被忽略

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

