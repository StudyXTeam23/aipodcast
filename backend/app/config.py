"""
配置管理模块
使用 pydantic-settings 管理环境变量
"""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用配置
    app_name: str = "EchoCast API"
    api_port: int = 18188
    api_domain: str = "https://echocast.genstudy.ai"  # API 域名（用于生成完整 URL）
    debug: bool = True
    
    # AWS S3 配置
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_s3_bucket: str = "class-recorder-recordings"
    aws_region: str = "us-east-1"
    
    # ElevenLabs API 配置
    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = "JBFqnCBsd6RMkjVDRZzb"  # 默认语音ID
    elevenlabs_model_id: str = "eleven_v3"  # v3 模型，支持对话功能
    elevenlabs_output_format: str = "mp3_44100_128"
    
    # Gemini API 配置
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-pro"  # 升级到 2.5 Pro 以获得更好的内容质量
    gemini_api_url: str = "https://aiplatform.googleapis.com/v1/publishers/google/models"
    
    # 数据目录配置
    data_dir: Path = Path(__file__).parent.parent / "data"
    temp_dir: Path = Path(__file__).parent.parent / "temp"
    
    # 文件上传限制
    max_upload_size: int = 100 * 1024 * 1024  # 100MB
    allowed_extensions: list = [".txt", ".pdf", ".doc", ".docx", ".mp3", ".wav", ".mp4", ".mov"]
    
    class Config:
        env_file = Path(__file__).parent.parent.parent / ".env"
        case_sensitive = False
        env_file_encoding = 'utf-8'


# 创建全局配置实例
settings = Settings()

# 确保目录存在
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.temp_dir.mkdir(parents=True, exist_ok=True)

