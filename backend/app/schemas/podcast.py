"""
Podcast 相关的 Pydantic 模型
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PodcastResponse(BaseModel):
    """播客响应模型"""
    id: str
    title: str
    original_filename: str
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    duration_seconds: Optional[int] = None
    file_size_bytes: Optional[int] = None
    status: str = Field(description="processing, completed, failed")
    created_at: str
    updated_at: str
    
    # 新增字段：支持多种内容源
    source_type: Optional[str] = Field(
        default="text",
        description="内容来源类型：text（文本/文档）/ audio（音频文件）/ video（视频文件）/ youtube（YouTube 视频）"
    )
    source_url: Optional[str] = Field(
        default=None,
        description="原始来源 URL（如 YouTube 链接）"
    )
    extraction_metadata: Optional[dict] = Field(
        default=None,
        description="提取的元数据（如主题、摘要、关键点等）"
    )
    original_duration: Optional[float] = Field(
        default=None,
        description="原始音频/视频时长（秒）"
    )
    original_format: Optional[str] = Field(
        default=None,
        description="原始文件格式（如 mp3, mp4, youtube 等）"
    )


class JobResponse(BaseModel):
    """任务响应模型"""
    id: str
    podcast_id: str
    type: Optional[str] = Field(default="upload", description="任务类型: upload, generate")
    inputs: Optional[dict] = Field(default=None, description="任务输入参数")
    status: str = Field(description="pending, processing, completed, failed")
    progress: int = Field(default=0, ge=0, le=100, description="处理进度 0-100")
    error_message: Optional[str] = None
    created_at: str
    updated_at: str


class UploadResponse(BaseModel):
    """上传响应模型"""
    podcast_id: str
    job_id: str
    status: str
    message: str = "文件上传成功，正在处理中"


class GenerateRequest(BaseModel):
    """AI 生成播客请求模型"""
    topic: str = Field(description="播客主题", min_length=5, max_length=500)
    style: str = Field(
        default="Solo Talk Show",
        description="播客风格：Solo Talk Show/Conversation/Storytelling"
    )
    duration_minutes: Optional[int] = Field(
        default=5,
        ge=3,
        le=15,
        description="目标时长（分钟）"
    )
    language: str = Field(
        default="en",
        description="播客语言：en (English) / zh (Chinese)"
    )


class AnalyzeAndGenerateRequest(BaseModel):
    """从音频/视频分析并生成播客请求模型"""
    file_s3_key: str = Field(description="已上传文件的 S3 key")
    enhancement_prompt: Optional[str] = Field(
        default=None,
        description="增强提示：指导 AI 关注特定方面"
    )
    source_type: str = Field(
        description="源文件类型：audio 或 video"
    )
    style: str = Field(
        default="Conversation",
        description="播客风格：Solo Talk Show/Conversation/Storytelling"
    )
    duration_minutes: Optional[int] = Field(
        default=5,
        ge=3,
        le=15,
        description="目标时长（分钟）"
    )
    language: str = Field(
        default="en",
        description="播客语言：en (English) / zh (Chinese)"
    )


class ApiResponse(BaseModel):
    """统一 API 响应格式"""
    success: bool
    data: Optional[dict] = None
    message: str = ""
    error: Optional[str] = None

