"""
EchoCast FastAPI 应用入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import podcasts, jobs

# 创建 FastAPI 应用实例
app = FastAPI(
    title=settings.app_name,
    description="AI-powered podcast generation platform",
    version="1.0.0 (Demo)",
    debug=settings.debug
)

# 注册路由
app.include_router(podcasts.router)
app.include_router(jobs.router)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3003",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:5173",
        "http://13.52.175.51:3003",
        "http://172.31.1.167:3003",
        # Production domain
        "https://echocast.genstudy.ai",
        "http://echocast.genstudy.ai",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # 允许所有 Vercel 部署域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Welcome to EchoCast API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "data_dir": str(settings.data_dir),
        "temp_dir": str(settings.temp_dir)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.api_port,
        reload=settings.debug
    )

