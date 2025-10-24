"""
Podcast API 路由
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from typing import Optional, List
import uuid
from pathlib import Path
import io

from app.schemas.podcast import UploadResponse, ApiResponse, PodcastResponse, GenerateRequest
from app.services.data_service import data_service
from app.utils.s3_storage import s3_storage
from app.config import settings

router = APIRouter(prefix="/api/v1/podcasts", tags=["podcasts"])


def validate_file(file: UploadFile) -> tuple[bool, Optional[str]]:
    """
    验证上传文件
    
    Returns:
        (是否有效, 错误消息)
    """
    # 检查文件名
    if not file.filename:
        return False, "文件名不能为空"
    
    # 检查文件扩展名
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.allowed_extensions:
        return False, f"不支持的文件类型: {file_ext}。支持的类型: {', '.join(settings.allowed_extensions)}"
    
    # 检查文件大小
    file.file.seek(0, 2)  # 移动到文件末尾
    file_size = file.file.tell()
    file.file.seek(0)  # 重置到开头
    
    if file_size > settings.max_upload_size:
        max_size_mb = settings.max_upload_size / (1024 * 1024)
        return False, f"文件过大: {file_size / (1024 * 1024):.2f}MB。最大允许: {max_size_mb}MB"
    
    if file_size == 0:
        return False, "文件为空"
    
    return True, None


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    上传文件创建播客
    
    1. 验证文件（类型、大小）
    2. 上传到 S3
    3. 创建 podcast 和 job 记录
    4. 返回 podcast_id 和 job_id
    """
    # 1. 验证文件
    is_valid, error_msg = validate_file(file)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    try:
        # 2. 上传文件到 S3
        file_content = await file.read()
        
        # 重新包装为 BytesIO 对象
        import io
        file_obj = io.BytesIO(file_content)
        
        s3_key = s3_storage.upload_file(
            file_obj=file_obj,
            original_filename=file.filename,
            prefix="uploads",
            content_type=file.content_type
        )
        
        if not s3_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="文件上传到 S3 失败"
            )
        
        # 3. 创建 podcast 和 job 记录
        podcast_id = str(uuid.uuid4())
        job_id = str(uuid.uuid4())
        
        # 保存 podcast 记录
        podcast_data = {
            "id": podcast_id,
            "title": file.filename,  # 使用文件名作为标题
            "original_filename": file.filename,
            "s3_key": s3_key,
            "file_size_bytes": len(file_content),
            "status": "processing"
        }
        
        success = data_service.save_podcast(podcast_data)
        if not success:
            # 回滚 S3 上传
            s3_storage.delete_file(s3_key)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="保存播客记录失败"
            )
        
        # 保存 job 记录
        job_data = {
            "id": job_id,
            "podcast_id": podcast_id,
            "status": "pending",
            "progress": 0,
            "s3_key": s3_key
        }
        
        success = data_service.save_job(job_data)
        if not success:
            # 回滚
            data_service.delete_podcast(podcast_id)
            s3_storage.delete_file(s3_key)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="保存任务记录失败"
            )
        
        # 4. 启动后台处理
        from app.tasks.process_podcast import start_processing_task
        start_processing_task(podcast_id, job_id, s3_key)
        
        # 5. 返回响应
        return UploadResponse(
            podcast_id=podcast_id,
            job_id=job_id,
            status="processing",
            message=f"文件 '{file.filename}' 上传成功，正在处理中"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 上传异常: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"文件上传失败: {str(e)}"
        )


@router.get("", response_model=List[PodcastResponse])
async def get_podcasts(
    page: int = Query(1, ge=1, description="页码"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    search: Optional[str] = Query(None, description="搜索标题")
):
    """
    获取播客列表
    
    - **page**: 页码（从1开始）
    - **limit**: 每页数量（1-100）
    - **search**: 搜索关键词（匹配标题）
    """
    try:
        # 读取所有播客
        all_podcasts = data_service.read_podcasts()
        
        # 搜索过滤
        if search:
            search_lower = search.lower()
            all_podcasts = [
                p for p in all_podcasts 
                if search_lower in p.get("title", "").lower()
            ]
        
        # 排序：按创建时间降序
        all_podcasts.sort(
            key=lambda x: x.get("created_at", ""),
            reverse=True
        )
        
        # 分页
        start = (page - 1) * limit
        end = start + limit
        podcasts = all_podcasts[start:end]
        
        # 为每个播客设置流式播放 URL
        for podcast in podcasts:
            if podcast.get("audio_s3_key"):
                # 使用后端流式播放端点
                podcast["audio_url"] = f"/api/v1/podcasts/{podcast['id']}/stream"
        
        return podcasts
    
    except Exception as e:
        print(f"❌ 获取播客列表异常: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取播客列表失败: {str(e)}"
        )


@router.get("/{podcast_id}", response_model=PodcastResponse)
async def get_podcast(podcast_id: str):
    """
    获取播客详情
    
    - **podcast_id**: 播客ID
    """
    podcast = data_service.get_podcast(podcast_id)
    
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"播客不存在: {podcast_id}"
        )
    
    # 如果有音频文件，使用流式播放 URL
    if podcast.get("audio_s3_key"):
        # 使用后端流式播放端点
        podcast["audio_url"] = f"/api/v1/podcasts/{podcast_id}/stream"
    
    return podcast


@router.delete("/{podcast_id}")
async def delete_podcast(podcast_id: str):
    """
    删除播客
    
    - **podcast_id**: 播客ID
    """
    try:
        # 获取播客信息
        podcast = data_service.get_podcast(podcast_id)
        
        if not podcast:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"播客不存在: {podcast_id}"
            )
        
        # 删除 S3 文件
        s3_key = podcast.get("s3_key")
        if s3_key:
            s3_storage.delete_file(s3_key)
        
        # 删除音频文件（如果存在）
        audio_s3_key = podcast.get("audio_s3_key")
        if audio_s3_key:
            s3_storage.delete_file(audio_s3_key)
        
        # 删除数据库记录
        success = data_service.delete_podcast(podcast_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="删除播客记录失败"
            )
        
        return {
            "success": True,
            "message": f"播客 '{podcast.get('title')}' 已删除"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 删除播客异常: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除播客失败: {str(e)}"
        )


@router.get("/{podcast_id}/download")
async def download_podcast(podcast_id: str):
    """
    获取播客下载链接
    
    - **podcast_id**: 播客ID
    
    返回预签名下载 URL（有效期1小时）
    """
    try:
        # 获取播客信息
        podcast = data_service.get_podcast(podcast_id)
        
        if not podcast:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"播客不存在: {podcast_id}"
            )
        
        # 检查音频是否已生成
        audio_s3_key = podcast.get("audio_s3_key")
        if not audio_s3_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="播客音频尚未生成，请稍后再试"
            )
        
        # 生成预签名 URL（1小时有效期），强制下载
        filename = f"{podcast.get('title', 'podcast')}.mp3"
        download_url = s3_storage.generate_presigned_url(
            audio_s3_key,
            expires_in=3600,
            filename=filename,
            force_download=True
        )
        
        if not download_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="生成下载链接失败"
            )
        
        return {
            "success": True,
            "download_url": download_url,
            "expires_in": 3600,
            "filename": filename
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 获取下载链接异常: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取下载链接失败: {str(e)}"
        )


@router.get("/{podcast_id}/stream")
async def stream_podcast(podcast_id: str):
    """
    流式播放播客音频
    
    - **podcast_id**: 播客ID
    
    直接从 S3 流式传输音频数据
    """
    try:
        # 获取播客信息
        podcast = data_service.get_podcast(podcast_id)
        
        if not podcast:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"播客不存在: {podcast_id}"
            )
        
        # 检查音频是否已生成
        audio_s3_key = podcast.get("audio_s3_key")
        if not audio_s3_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="播客音频尚未生成，请稍后再试"
            )
        
        # 从 S3 下载音频数据
        audio_data = s3_storage.download_file(audio_s3_key)
        if not audio_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="音频文件下载失败"
            )
        
        # 对文件名进行URL编码以支持中文
        from urllib.parse import quote
        from io import BytesIO
        
        filename = podcast.get('title', 'podcast')
        encoded_filename = quote(filename)
        
        # 使用 BytesIO 包装音频数据，确保可以被多次读取
        # 并添加 Content-Length 头让浏览器知道音频总长度
        return StreamingResponse(
            BytesIO(audio_data),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"inline; filename*=UTF-8''{encoded_filename}.mp3",
                "Content-Length": str(len(audio_data)),
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=3600"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 流式播放异常: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"流式播放失败: {str(e)}"
        )


@router.post("/generate", response_model=UploadResponse)
async def generate_podcast(request: GenerateRequest):
    """
    使用 AI 生成播客
    
    根据用户提供的主题和风格，使用 Gemini AI 生成播客稿件，
    然后使用 ElevenLabs TTS 生成音频
    
    - **topic**: 播客主题 (5-500字符)
    - **style**: 播客风格 (单人脱口秀/双人对话/故事叙述)
    - **duration_minutes**: 目标时长 (3-15分钟)
    """
    try:
        # 1. 创建 podcast 和 job 记录
        podcast_id = str(uuid.uuid4())
        job_id = str(uuid.uuid4())
        
        # 使用主题作为标题（截取前50字符）
        title = request.topic[:50] + ("..." if len(request.topic) > 50 else "")
        
        # 保存 podcast 记录
        podcast_data = {
            "id": podcast_id,
            "title": title,
            "original_filename": f"AI生成-{request.style}",
            "status": "processing"
        }
        
        success = data_service.save_podcast(podcast_data)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="保存播客记录失败"
            )
        
        # 保存 job 记录（包含 type 和 inputs）
        job_data = {
            "id": job_id,
            "podcast_id": podcast_id,
            "type": "generate",  # 标记为 AI 生成类型
            "inputs": {
                "topic": request.topic,
                "style": request.style,
                "duration_minutes": request.duration_minutes,
                "language": request.language
            },
            "status": "pending",
            "progress": 0
        }
        
        success = data_service.save_job(job_data)
        if not success:
            # 回滚
            data_service.delete_podcast(podcast_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="保存任务记录失败"
            )
        
        # 2. 启动后台 AI 生成任务
        from app.tasks.process_podcast import start_processing_task
        start_processing_task(podcast_id, job_id, None)  # s3_key 为 None（无需下载文件）
        
        # 3. 返回响应
        return UploadResponse(
            podcast_id=podcast_id,
            job_id=job_id,
            status="processing",
            message=f"正在生成播客：{title}"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ AI生成播客异常: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI生成播客失败: {str(e)}"
        )

