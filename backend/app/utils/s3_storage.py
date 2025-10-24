"""
AWS S3 存储服务
提供文件上传、下载、删除和预签名 URL 生成功能
"""
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from botocore.config import Config
import uuid
from pathlib import Path
from typing import Optional, BinaryIO
from app.config import settings


class S3Storage:
    """S3 存储服务类"""
    
    def __init__(self):
        """初始化 S3 客户端"""
        self.config = Config(
            connect_timeout=60,  # 增加到60秒
            read_timeout=300,    # 增加到5分钟（支持大文件上传）
            retries={'max_attempts': 3}
        )
        
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region,
            config=self.config
        )
        
        self.bucket = settings.aws_s3_bucket
        self.region = settings.aws_region
    
    def _generate_unique_key(self, original_filename: str, prefix: str = "uploads") -> str:
        """生成唯一的 S3 对象键"""
        # 获取文件扩展名
        suffix = Path(original_filename).suffix
        # 生成 UUID 文件名
        unique_name = f"{uuid.uuid4()}{suffix}"
        # 返回完整路径
        return f"{prefix}/{unique_name}"
    
    def upload_file(
        self, 
        file_obj: BinaryIO, 
        original_filename: str,
        prefix: str = "uploads",
        content_type: Optional[str] = None
    ) -> Optional[str]:
        """
        上传文件到 S3
        
        Args:
            file_obj: 文件对象
            original_filename: 原始文件名
            prefix: S3 键前缀
            content_type: 文件 MIME 类型
        
        Returns:
            S3 对象键，失败返回 None
        """
        try:
            # 生成唯一键
            key = self._generate_unique_key(original_filename, prefix)
            
            # 准备上传参数
            upload_args = {
                'Bucket': self.bucket,
                'Key': key,
                'Body': file_obj
            }
            
            if content_type:
                upload_args['ContentType'] = content_type
            
            # 上传文件
            self.s3_client.put_object(**upload_args)
            
            print(f"✅ 文件上传成功: s3://{self.bucket}/{key}")
            return key
        
        except NoCredentialsError:
            print("❌ AWS 凭证错误")
            return None
        except ClientError as e:
            print(f"❌ S3 上传失败: {e}")
            return None
        except Exception as e:
            print(f"❌ 上传异常: {e}")
            return None
    
    def download_file(self, key: str) -> Optional[bytes]:
        """
        从 S3 下载文件
        
        Args:
            key: S3 对象键
        
        Returns:
            文件内容（字节），失败返回 None
        """
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket,
                Key=key
            )
            content = response['Body'].read()
            print(f"✅ 文件下载成功: {key} ({len(content)} bytes)")
            return content
        
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                print(f"❌ 文件不存在: {key}")
            else:
                print(f"❌ S3 下载失败: {e}")
            return None
        except Exception as e:
            print(f"❌ 下载异常: {e}")
            return None
    
    def delete_file(self, key: str) -> bool:
        """
        删除 S3 文件
        
        Args:
            key: S3 对象键
        
        Returns:
            是否成功删除
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket,
                Key=key
            )
            print(f"✅ 文件删除成功: {key}")
            return True
        
        except ClientError as e:
            print(f"❌ S3 删除失败: {e}")
            return False
        except Exception as e:
            print(f"❌ 删除异常: {e}")
            return False
    
    def generate_presigned_url(self, key: str, expires_in: int = 3600, filename: str = None, force_download: bool = False) -> Optional[str]:
        """
        生成预签名下载 URL
        
        Args:
            key: S3 对象键
            expires_in: URL 有效期（秒），默认 1 小时
            filename: 下载时的文件名（可选）
            force_download: 是否强制下载而不是在浏览器中打开
        
        Returns:
            预签名 URL，失败返回 None
        """
        try:
            params = {
                'Bucket': self.bucket,
                'Key': key
            }
            
            # 如果需要强制下载，添加 Content-Disposition 头
            if force_download:
                from urllib.parse import quote
                download_filename = filename if filename else key.split('/')[-1]
                # 使用 RFC 6266 格式支持中文文件名
                encoded_filename = quote(download_filename)
                params['ResponseContentDisposition'] = f'attachment; filename*=UTF-8\'\'{encoded_filename}'
            
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params=params,
                ExpiresIn=expires_in
            )
            print(f"✅ 预签名 URL 生成成功: {key} (有效期: {expires_in}秒)")
            return url
        
        except ClientError as e:
            print(f"❌ 生成预签名 URL 失败: {e}")
            return None
        except Exception as e:
            print(f"❌ 生成 URL 异常: {e}")
            return None
    
    def get_public_url(self, key: str) -> str:
        """
        获取文件的公开 URL（如果存储桶是公开的）
        
        Args:
            key: S3 对象键
        
        Returns:
            公开 URL
        """
        return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{key}"
    
    def file_exists(self, key: str) -> bool:
        """
        检查文件是否存在
        
        Args:
            key: S3 对象键
        
        Returns:
            文件是否存在
        """
        try:
            self.s3_client.head_object(
                Bucket=self.bucket,
                Key=key
            )
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            raise
        except Exception:
            return False


# 创建全局实例
s3_storage = S3Storage()

