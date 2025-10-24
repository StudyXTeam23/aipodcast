"""
内容提取服务 - 从音频/视频中提取和分析内容
使用 Gemini API 分析音频/视频内容并生成结构化数据
"""
import httpx
import io
from pathlib import Path
from typing import Dict, Any, Optional
from app.config import settings


class ContentExtractor:
    """音频/视频内容提取和分析服务"""
    
    # 支持的音频格式
    AUDIO_FORMATS = {'.mp3', '.wav', '.m4a', '.ogg', '.flac'}
    
    # 支持的视频格式
    VIDEO_FORMATS = {'.mp4', '.mov', '.avi', '.mkv', '.webm'}
    
    def __init__(self):
        """初始化 ContentExtractor"""
        self.gemini_api_key = settings.gemini_api_key
        self.gemini_model = settings.gemini_model
        self.gemini_api_url = settings.gemini_api_url
        self.temp_dir = settings.temp_dir
        
        # 确保临时目录存在
        self.temp_dir.mkdir(parents=True, exist_ok=True)
    
    def is_audio_file(self, filename: str) -> bool:
        """检查是否为音频文件"""
        return Path(filename).suffix.lower() in self.AUDIO_FORMATS
    
    def is_video_file(self, filename: str) -> bool:
        """检查是否为视频文件"""
        return Path(filename).suffix.lower() in self.VIDEO_FORMATS
    
    def validate_file_format(self, filename: str) -> tuple[bool, str]:
        """
        验证文件格式
        
        Args:
            filename: 文件名
        
        Returns:
            (is_valid, file_type) - (是否有效, 文件类型: 'audio'/'video'/None)
        """
        if self.is_audio_file(filename):
            return True, 'audio'
        elif self.is_video_file(filename):
            return True, 'video'
        else:
            return False, None
    
    async def extract_from_audio(
        self, 
        audio_content: bytes, 
        filename: str,
        enhancement_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        从音频文件中提取内容
        
        Args:
            audio_content: 音频文件内容（字节）
            filename: 文件名
            enhancement_prompt: 可选的增强提示
        
        Returns:
            提取的内容和元数据
            {
                'transcript': str,  # 转录文本
                'summary': str,     # 内容摘要
                'topics': list,     # 关键主题
                'insights': list,   # 核心观点
                'duration': float,  # 时长（秒）
                'format': str       # 文件格式
            }
        
        Raises:
            Exception: 如果提取失败
        """
        try:
            print(f"🎵 开始提取音频内容...")
            print(f"   文件名: {filename}")
            print(f"   音频大小: {len(audio_content)} bytes")
            
            # 验证格式
            is_valid, file_type = self.validate_file_format(filename)
            if not is_valid or file_type != 'audio':
                raise ValueError(f"不支持的音频格式: {filename}")
            
            # 使用 Gemini API 分析音频
            analysis_result = await self._analyze_audio_with_gemini(
                audio_content, 
                filename,
                enhancement_prompt
            )
            
            # 提取元数据
            file_format = Path(filename).suffix.lower().lstrip('.')
            
            result = {
                'transcript': analysis_result.get('transcript', ''),
                'summary': analysis_result.get('summary', ''),
                'topics': analysis_result.get('topics', []),
                'insights': analysis_result.get('insights', []),
                'duration': analysis_result.get('duration', 0.0),
                'format': file_format,
                'file_type': 'audio',
                'original_filename': filename
            }
            
            print(f"✅ 音频内容提取成功！")
            print(f"   转录长度: {len(result['transcript'])} 字符")
            print(f"   主题数: {len(result['topics'])}")
            
            return result
        
        except Exception as e:
            print(f"❌ 音频内容提取失败: {e}")
            raise Exception(f"音频内容提取失败: {str(e)}")
    
    async def extract_from_video(
        self, 
        video_content: bytes, 
        filename: str,
        enhancement_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        从视频文件中提取内容
        
        Args:
            video_content: 视频文件内容（字节）
            filename: 文件名
            enhancement_prompt: 可选的增强提示
        
        Returns:
            提取的内容和元数据
        
        Raises:
            Exception: 如果提取失败
        """
        try:
            print(f"🎬 开始提取视频内容...")
            print(f"   文件名: {filename}")
            print(f"   视频大小: {len(video_content)} bytes")
            
            # 验证格式
            is_valid, file_type = self.validate_file_format(filename)
            if not is_valid or file_type != 'video':
                raise ValueError(f"不支持的视频格式: {filename}")
            
            # 使用 Gemini API 分析视频
            analysis_result = await self._analyze_video_with_gemini(
                video_content, 
                filename,
                enhancement_prompt
            )
            
            # 提取元数据
            file_format = Path(filename).suffix.lower().lstrip('.')
            
            result = {
                'transcript': analysis_result.get('transcript', ''),
                'summary': analysis_result.get('summary', ''),
                'topics': analysis_result.get('topics', []),
                'insights': analysis_result.get('insights', []),
                'duration': analysis_result.get('duration', 0.0),
                'format': file_format,
                'file_type': 'video',
                'original_filename': filename
            }
            
            print(f"✅ 视频内容提取成功！")
            print(f"   转录长度: {len(result['transcript'])} 字符")
            print(f"   主题数: {len(result['topics'])}")
            
            return result
        
        except Exception as e:
            print(f"❌ 视频内容提取失败: {e}")
            raise Exception(f"视频内容提取失败: {str(e)}")
    
    async def _analyze_audio_with_gemini(
        self, 
        audio_content: bytes, 
        filename: str,
        enhancement_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        使用 Gemini API 分析音频内容
        
        Args:
            audio_content: 音频内容
            filename: 文件名
            enhancement_prompt: 增强提示
        
        Returns:
            分析结果
        """
        try:
            import base64
            
            print(f"🤖 使用 Gemini API 分析音频...")
            
            # 将音频编码为 base64
            audio_base64 = base64.b64encode(audio_content).decode('utf-8')
            
            # 构建分析提示词
            analysis_prompt = """请分析这个音频文件的内容，并提供以下信息：

1. **完整转录**：将音频内容转录为文字
2. **内容摘要**：简要概括主要内容（100-200字）
3. **关键主题**：列出3-5个核心主题（每个主题5-10字）
4. **核心观点**：提取3-5个关键观点或要点（每个观点10-30字）

"""
            
            if enhancement_prompt:
                analysis_prompt += f"\n特别关注：{enhancement_prompt}\n"
            
            analysis_prompt += """
请以 JSON 格式返回结果：
{
  "transcript": "完整的音频转录文字...",
  "summary": "内容摘要...",
  "topics": ["主题1", "主题2", "主题3"],
  "insights": ["观点1", "观点2", "观点3"],
  "duration": 估算的音频时长（秒）
}

CRITICAL: 
- 直接返回 JSON，不要包含任何 markdown 代码块标记（```json 或 ```）
- 不要添加任何额外的解释文字
- 确保 JSON 格式完全正确
"""
            
            # 构建 Gemini API 请求
            # 注意：Gemini 支持音频输入
            url = f"{self.gemini_api_url}/{self.gemini_model}:generateContent?key={self.gemini_api_key}"
            
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": analysis_prompt
                            },
                            {
                                "inline_data": {
                                    "mime_type": self._get_mime_type(filename),
                                    "data": audio_base64
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,  # 较低温度以保证准确性
                    "maxOutputTokens": 4000
                }
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                
                data = response.json()
                content = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                
                if not content:
                    raise Exception("Gemini API 返回空响应")
                
                # 解析 JSON 响应
                import json
                # 清理可能的 markdown 代码块标记
                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
                
                result = json.loads(content)
                
                print(f"✅ Gemini 音频分析成功")
                return result
        
        except json.JSONDecodeError as e:
            print(f"❌ JSON 解析失败: {e}")
            print(f"原始响应: {content[:500]}...")
            # 返回基本结构
            return {
                'transcript': content,
                'summary': '内容分析失败',
                'topics': [],
                'insights': [],
                'duration': 0.0
            }
        except Exception as e:
            print(f"❌ Gemini 音频分析失败: {e}")
            raise
    
    async def _analyze_video_with_gemini(
        self, 
        video_content: bytes, 
        filename: str,
        enhancement_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        使用 Gemini API 分析视频内容
        
        Args:
            video_content: 视频内容
            filename: 文件名
            enhancement_prompt: 增强提示
        
        Returns:
            分析结果
        """
        try:
            import base64
            
            print(f"🤖 使用 Gemini API 分析视频...")
            
            # 将视频编码为 base64
            video_base64 = base64.b64encode(video_content).decode('utf-8')
            
            # 构建分析提示词
            analysis_prompt = """请分析这个视频文件的内容，并提供以下信息：

1. **完整转录**：将视频中的语音内容转录为文字
2. **内容摘要**：简要概括主要内容（100-200字）
3. **关键主题**：列出3-5个核心主题（每个主题5-10字）
4. **核心观点**：提取3-5个关键观点或要点（每个观点10-30字）

"""
            
            if enhancement_prompt:
                analysis_prompt += f"\n特别关注：{enhancement_prompt}\n"
            
            analysis_prompt += """
请以 JSON 格式返回结果：
{
  "transcript": "完整的视频语音转录文字...",
  "summary": "内容摘要...",
  "topics": ["主题1", "主题2", "主题3"],
  "insights": ["观点1", "观点2", "观点3"],
  "duration": 估算的视频时长（秒）
}

CRITICAL: 
- 直接返回 JSON，不要包含任何 markdown 代码块标记（```json 或 ```）
- 不要添加任何额外的解释文字
- 确保 JSON 格式完全正确
"""
            
            # 构建 Gemini API 请求
            url = f"{self.gemini_api_url}/{self.gemini_model}:generateContent?key={self.gemini_api_key}"
            
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": analysis_prompt
                            },
                            {
                                "inline_data": {
                                    "mime_type": self._get_mime_type(filename),
                                    "data": video_base64
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 4000
                }
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                
                data = response.json()
                content = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                
                if not content:
                    raise Exception("Gemini API 返回空响应")
                
                # 解析 JSON 响应
                import json
                # 清理可能的 markdown 代码块标记
                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
                
                result = json.loads(content)
                
                print(f"✅ Gemini 视频分析成功")
                return result
        
        except json.JSONDecodeError as e:
            print(f"❌ JSON 解析失败: {e}")
            print(f"原始响应: {content[:500]}...")
            # 返回基本结构
            return {
                'transcript': content,
                'summary': '内容分析失败',
                'topics': [],
                'insights': [],
                'duration': 0.0
            }
        except Exception as e:
            print(f"❌ Gemini 视频分析失败: {e}")
            raise
    
    def _get_mime_type(self, filename: str) -> str:
        """
        根据文件名获取 MIME 类型
        
        Args:
            filename: 文件名
        
        Returns:
            MIME 类型字符串
        """
        mime_types = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.m4a': 'audio/mp4',
            '.ogg': 'audio/ogg',
            '.flac': 'audio/flac',
            '.mp4': 'video/mp4',
            '.mov': 'video/quicktime',
            '.avi': 'video/x-msvideo',
            '.mkv': 'video/x-matroska',
            '.webm': 'video/webm'
        }
        
        suffix = Path(filename).suffix.lower()
        return mime_types.get(suffix, 'application/octet-stream')
    
    async def extract_from_file(
        self, 
        file_content: bytes, 
        filename: str,
        enhancement_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        自动检测文件类型并提取内容
        
        Args:
            file_content: 文件内容
            filename: 文件名
            enhancement_prompt: 可选的增强提示
        
        Returns:
            提取的内容和元数据
        
        Raises:
            Exception: 如果提取失败或格式不支持
        """
        is_valid, file_type = self.validate_file_format(filename)
        
        if not is_valid:
            raise ValueError(f"不支持的文件格式: {filename}")
        
        if file_type == 'audio':
            return await self.extract_from_audio(file_content, filename, enhancement_prompt)
        elif file_type == 'video':
            return await self.extract_from_video(file_content, filename, enhancement_prompt)
        else:
            raise ValueError(f"未知的文件类型: {file_type}")


# 创建全局实例
content_extractor = ContentExtractor()

