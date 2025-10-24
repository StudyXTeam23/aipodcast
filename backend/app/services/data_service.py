"""
JSON 数据服务
提供线程安全的 JSON 文件读写操作
"""
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from filelock import FileLock
from datetime import datetime
from app.config import settings


class DataService:
    """JSON 数据服务类"""
    
    def __init__(self):
        self.podcasts_file = settings.data_dir / "podcasts.json"
        self.jobs_file = settings.data_dir / "jobs.json"
        self.podcasts_lock = FileLock(str(self.podcasts_file) + ".lock")
        self.jobs_lock = FileLock(str(self.jobs_file) + ".lock")
        
        # 确保文件存在
        self._ensure_file_exists(self.podcasts_file, {"podcasts": []})
        self._ensure_file_exists(self.jobs_file, {"jobs": []})
    
    def _ensure_file_exists(self, file_path: Path, default_data: dict):
        """确保 JSON 文件存在"""
        if not file_path.exists():
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(default_data, f, ensure_ascii=False, indent=2)
    
    def _read_json(self, file_path: Path, lock: FileLock) -> dict:
        """读取 JSON 文件（带锁）"""
        with lock:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                # 文件不存在或损坏，返回默认结构
                default_data = {"podcasts": []} if "podcasts" in str(file_path) else {"jobs": []}
                self._ensure_file_exists(file_path, default_data)
                return default_data
    
    def _write_json(self, file_path: Path, lock: FileLock, data: dict):
        """写入 JSON 文件（带锁）"""
        with lock:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
    
    # ========== Podcast 相关操作 ==========
    
    def read_podcasts(self) -> List[Dict[str, Any]]:
        """读取所有播客"""
        data = self._read_json(self.podcasts_file, self.podcasts_lock)
        return data.get("podcasts", [])
    
    def get_podcast(self, podcast_id: str) -> Optional[Dict[str, Any]]:
        """获取单个播客"""
        podcasts = self.read_podcasts()
        for podcast in podcasts:
            if podcast.get("id") == podcast_id:
                return podcast
        return None
    
    def save_podcast(self, podcast_data: Dict[str, Any]) -> bool:
        """保存新播客"""
        try:
            data = self._read_json(self.podcasts_file, self.podcasts_lock)
            podcasts = data.get("podcasts", [])
            
            # 添加时间戳
            if "created_at" not in podcast_data:
                podcast_data["created_at"] = datetime.now().isoformat()
            podcast_data["updated_at"] = datetime.now().isoformat()
            
            podcasts.append(podcast_data)
            data["podcasts"] = podcasts
            
            self._write_json(self.podcasts_file, self.podcasts_lock, data)
            return True
        except Exception as e:
            print(f"Error saving podcast: {e}")
            return False
    
    def update_podcast(self, podcast_id: str, updates: Dict[str, Any]) -> bool:
        """更新播客信息"""
        try:
            data = self._read_json(self.podcasts_file, self.podcasts_lock)
            podcasts = data.get("podcasts", [])
            
            for i, podcast in enumerate(podcasts):
                if podcast.get("id") == podcast_id:
                    # 更新字段
                    podcasts[i].update(updates)
                    podcasts[i]["updated_at"] = datetime.now().isoformat()
                    
                    data["podcasts"] = podcasts
                    self._write_json(self.podcasts_file, self.podcasts_lock, data)
                    return True
            
            return False  # 未找到
        except Exception as e:
            print(f"Error updating podcast: {e}")
            return False
    
    def delete_podcast(self, podcast_id: str) -> bool:
        """删除播客"""
        try:
            data = self._read_json(self.podcasts_file, self.podcasts_lock)
            podcasts = data.get("podcasts", [])
            
            # 过滤掉要删除的播客
            podcasts = [p for p in podcasts if p.get("id") != podcast_id]
            
            data["podcasts"] = podcasts
            self._write_json(self.podcasts_file, self.podcasts_lock, data)
            return True
        except Exception as e:
            print(f"Error deleting podcast: {e}")
            return False
    
    # ========== Job 相关操作 ==========
    
    def read_jobs(self) -> List[Dict[str, Any]]:
        """读取所有任务"""
        data = self._read_json(self.jobs_file, self.jobs_lock)
        return data.get("jobs", [])
    
    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """获取单个任务"""
        jobs = self.read_jobs()
        for job in jobs:
            if job.get("id") == job_id:
                return job
        return None
    
    def save_job(self, job_data: Dict[str, Any]) -> bool:
        """保存新任务"""
        try:
            data = self._read_json(self.jobs_file, self.jobs_lock)
            jobs = data.get("jobs", [])
            
            # 添加时间戳
            if "created_at" not in job_data:
                job_data["created_at"] = datetime.now().isoformat()
            job_data["updated_at"] = datetime.now().isoformat()
            
            jobs.append(job_data)
            data["jobs"] = jobs
            
            self._write_json(self.jobs_file, self.jobs_lock, data)
            return True
        except Exception as e:
            print(f"Error saving job: {e}")
            return False
    
    def update_job(self, job_id: str, updates: Dict[str, Any]) -> bool:
        """更新任务状态"""
        try:
            data = self._read_json(self.jobs_file, self.jobs_lock)
            jobs = data.get("jobs", [])
            
            for i, job in enumerate(jobs):
                if job.get("id") == job_id:
                    # 更新字段
                    jobs[i].update(updates)
                    jobs[i]["updated_at"] = datetime.now().isoformat()
                    
                    data["jobs"] = jobs
                    self._write_json(self.jobs_file, self.jobs_lock, data)
                    return True
            
            return False  # 未找到
        except Exception as e:
            print(f"Error updating job: {e}")
            return False
    
    def delete_job(self, job_id: str) -> bool:
        """删除任务"""
        try:
            data = self._read_json(self.jobs_file, self.jobs_lock)
            jobs = data.get("jobs", [])
            
            # 过滤掉要删除的任务
            jobs = [j for j in jobs if j.get("id") != job_id]
            
            data["jobs"] = jobs
            self._write_json(self.jobs_file, self.jobs_lock, data)
            return True
        except Exception as e:
            print(f"Error deleting job: {e}")
            return False


# 创建全局实例
data_service = DataService()

