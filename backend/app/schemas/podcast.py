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


class ApiResponse(BaseModel):
    """统一 API 响应格式"""
    success: bool
    data: Optional[dict] = None
    message: str = ""
    error: Optional[str] = None

