"""
Job (任务) API 路由
"""
from fastapi import APIRouter, HTTPException, status

from app.schemas.podcast import JobResponse
from app.services.data_service import data_service

router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    """
    获取任务状态
    
    - **job_id**: 任务ID
    
    返回任务的当前状态、进度和错误信息（如果有）
    """
    job = data_service.get_job(job_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"任务不存在: {job_id}"
        )
    
    return job

