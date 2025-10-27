"""
YouTube 内容提取服务
使用 yt-dlp 从 YouTube 视频提取内容和字幕
"""
import yt_dlp
import tempfile
import os
from pathlib import Path
from typing import Dict, Any, Optional
import re
from app.config import settings


class YouTubeExtractor:
    """YouTube 视频内容提取服务"""
    
    def __init__(self):
        """初始化 YouTubeExtractor"""
        self.temp_dir = settings.temp_dir
        self.temp_dir.mkdir(parents=True, exist_ok=True)
    
    def validate_url(self, url: str) -> tuple[bool, Optional[str]]:
        """
        验证 YouTube URL
        
        Args:
            url: YouTube 视频链接
        
        Returns:
            (is_valid, error_message)
        """
        if not url or not url.strip():
            return False, "URL 不能为空"
        
        # YouTube URL 正则匹配
        youtube_patterns = [
            r'(https?://)?(www\.)?youtube\.com/watch\?v=[\w-]+',
            r'(https?://)?(www\.)?youtu\.be/[\w-]+',
            r'(https?://)?(www\.)?youtube\.com/embed/[\w-]+',
            r'(https?://)?(www\.)?youtube\.com/v/[\w-]+',
        ]
        
        for pattern in youtube_patterns:
            if re.match(pattern, url.strip()):
                return True, None
        
        return False, "无效的 YouTube URL"
    
    def extract_video_id(self, url: str) -> Optional[str]:
        """
        从 YouTube URL 提取视频 ID
        
        Args:
            url: YouTube 视频链接
        
        Returns:
            视频 ID 或 None
        """
        patterns = [
            r'(?:v=|/)([0-9A-Za-z_-]{11}).*',
            r'youtu\.be/([0-9A-Za-z_-]{11})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
    
    def extract_metadata(self, url: str) -> Dict[str, Any]:
        """
        获取 YouTube 视频元数据（不下载视频）
        
        Args:
            url: YouTube 视频链接
        
        Returns:
            视频元数据字典
            {
                'title': str,
                'description': str,
                'duration': int,  # 秒
                'uploader': str,
                'upload_date': str,
                'view_count': int,
                'thumbnail': str,
                'video_id': str
            }
        
        Raises:
            Exception: 如果提取失败
        """
        try:
            print(f"📹 提取 YouTube 视频元数据...")
            print(f"   URL: {url}")
            
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'skip_download': True,
                # 绕过 YouTube 的 bot 检测
                'nocheckcertificate': True,
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'extractor_args': {'youtube': {'player_client': ['android', 'web']}},
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                metadata = {
                    'title': info.get('title', 'Unknown Title'),
                    'description': info.get('description', ''),
                    'duration': info.get('duration', 0),
                    'uploader': info.get('uploader', 'Unknown'),
                    'upload_date': info.get('upload_date', ''),
                    'view_count': info.get('view_count', 0),
                    'thumbnail': info.get('thumbnail', ''),
                    'video_id': info.get('id', self.extract_video_id(url)),
                    'channel': info.get('channel', ''),
                    'channel_id': info.get('channel_id', '')
                }
                
                print(f"✅ 元数据提取成功")
                print(f"   标题: {metadata['title']}")
                print(f"   时长: {metadata['duration']} 秒")
                print(f"   作者: {metadata['uploader']}")
                
                return metadata
        
        except Exception as e:
            print(f"❌ 元数据提取失败: {e}")
            raise Exception(f"无法提取 YouTube 视频元数据: {str(e)}")
    
    def download_subtitles(self, url: str, language: str = 'en') -> Optional[str]:
        """
        下载 YouTube 视频字幕
        
        Args:
            url: YouTube 视频链接
            language: 字幕语言代码（'en', 'zh-Hans', 'zh-Hant' 等）
        
        Returns:
            字幕文本内容，如果没有字幕则返回 None
        
        Raises:
            Exception: 如果下载失败
        """
        try:
            print(f"📝 尝试下载字幕...")
            print(f"   语言: {language}")
            
            # 创建临时文件
            temp_file = tempfile.NamedTemporaryFile(
                mode='w',
                suffix='.txt',
                dir=self.temp_dir,
                delete=False
            )
            temp_path = temp_file.name
            temp_file.close()
            
            # 配置 yt-dlp 下载字幕
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'skip_download': True,
                'writesubtitles': True,
                'writeautomaticsub': True,  # 也尝试自动生成的字幕
                'subtitleslangs': [language, 'en'],  # 优先请求的语言，回退到英文
                'subtitlesformat': 'srt',
                'outtmpl': temp_path.replace('.txt', ''),
                # 绕过 YouTube 的 bot 检测
                'nocheckcertificate': True,
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'extractor_args': {'youtube': {'player_client': ['android', 'web']}},
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            
            # 查找下载的字幕文件
            subtitle_file = None
            for ext in ['.en.srt', f'.{language}.srt', '.srt']:
                potential_file = temp_path.replace('.txt', ext)
                if os.path.exists(potential_file):
                    subtitle_file = potential_file
                    break
            
            if not subtitle_file:
                print(f"⚠️  没有找到可用的字幕")
                # 清理临时文件
                try:
                    os.remove(temp_path)
                except:
                    pass
                return None
            
            # 读取字幕内容
            with open(subtitle_file, 'r', encoding='utf-8') as f:
                subtitles = f.read()
            
            # 清理 SRT 格式，只保留文本
            cleaned_text = self._clean_srt_format(subtitles)
            
            # 清理临时文件
            try:
                os.remove(temp_path)
                os.remove(subtitle_file)
            except:
                pass
            
            print(f"✅ 字幕下载成功")
            print(f"   长度: {len(cleaned_text)} 字符")
            
            return cleaned_text
        
        except Exception as e:
            print(f"⚠️  字幕下载失败: {e}")
            # 清理临时文件
            try:
                if 'temp_path' in locals():
                    os.remove(temp_path)
            except:
                pass
            return None
    
    def _clean_srt_format(self, srt_content: str) -> str:
        """
        清理 SRT 字幕格式，只保留文本
        
        Args:
            srt_content: SRT 格式字幕
        
        Returns:
            纯文本内容
        """
        lines = srt_content.split('\n')
        text_lines = []
        
        for line in lines:
            line = line.strip()
            # 跳过序号、时间戳和空行
            if not line:
                continue
            if line.isdigit():
                continue
            if '-->' in line:
                continue
            # 保留文本行
            text_lines.append(line)
        
        # 合并文本，去除重复
        text = ' '.join(text_lines)
        return text
    
    def extract_audio(self, url: str) -> tuple[bytes, str]:
        """
        从 YouTube 视频提取音频（备用方案）
        
        Args:
            url: YouTube 视频链接
        
        Returns:
            (audio_content, format) - 音频字节内容和格式
        
        Raises:
            Exception: 如果提取失败
        """
        try:
            print(f"🎵 从 YouTube 提取音频...")
            
            # 创建临时文件
            temp_file = tempfile.NamedTemporaryFile(
                mode='wb',
                suffix='.mp3',
                dir=self.temp_dir,
                delete=False
            )
            temp_path = temp_file.name
            temp_file.close()
            
            # 配置 yt-dlp 提取音频
            ydl_opts = {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'outtmpl': temp_path.replace('.mp3', ''),
                'quiet': True,
                'no_warnings': True,
                # 绕过 YouTube 的 bot 检测
                'nocheckcertificate': True,
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'extractor_args': {'youtube': {'player_client': ['android', 'web']}},
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            
            # 读取音频文件
            audio_path = temp_path.replace('.mp3', '.mp3')  # yt-dlp 会自动添加扩展名
            if not os.path.exists(audio_path):
                # 尝试找到生成的文件
                base_path = temp_path.replace('.mp3', '')
                for ext in ['.mp3', '.m4a', '.webm']:
                    if os.path.exists(base_path + ext):
                        audio_path = base_path + ext
                        break
            
            if not os.path.exists(audio_path):
                raise Exception("音频文件未生成")
            
            with open(audio_path, 'rb') as f:
                audio_content = f.read()
            
            # 清理临时文件
            try:
                os.remove(audio_path)
                os.remove(temp_path)
            except:
                pass
            
            print(f"✅ 音频提取成功")
            print(f"   大小: {len(audio_content)} bytes")
            
            return audio_content, 'mp3'
        
        except Exception as e:
            print(f"❌ 音频提取失败: {e}")
            raise Exception(f"无法从 YouTube 提取音频: {str(e)}")
    
    async def extract_content(
        self,
        url: str,
        language: str = 'en',
        enhancement_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        从 YouTube 视频提取内容（字幕或音频转录）
        
        策略：
        1. 优先使用字幕（如果可用）
        2. 否则提取音频并使用 Gemini 转录
        
        Args:
            url: YouTube 视频链接
            language: 目标语言
            enhancement_prompt: 可选的增强提示
        
        Returns:
            提取的内容和元数据
            {
                'transcript': str,
                'summary': str,
                'topics': list,
                'insights': list,
                'metadata': dict,  # YouTube 元数据
                'source': str,     # 'subtitles' 或 'audio_transcription'
            }
        
        Raises:
            Exception: 如果提取失败
        """
        try:
            # 1. 获取视频元数据
            metadata = self.extract_metadata(url)
            
            # 2. 尝试下载字幕
            transcript = self.download_subtitles(url, language)
            source = 'subtitles' if transcript else 'audio_transcription'
            
            # 3. 如果没有字幕，提取音频并使用 Gemini 分析
            if not transcript:
                print(f"⚠️  没有字幕，将提取音频并使用 Gemini 分析...")
                audio_content, audio_format = self.extract_audio(url)
                
                # 使用 ContentExtractor 分析音频
                from app.services.content_extractor import content_extractor
                
                extraction_result = await content_extractor.extract_from_audio(
                    audio_content=audio_content,
                    filename=f"{metadata['video_id']}.{audio_format}",
                    enhancement_prompt=enhancement_prompt
                )
                
                return {
                    'transcript': extraction_result.get('transcript', ''),
                    'summary': extraction_result.get('summary', ''),
                    'topics': extraction_result.get('topics', []),
                    'insights': extraction_result.get('insights', []),
                    'metadata': metadata,
                    'source': source,
                    'duration': metadata['duration']
                }
            
            # 4. 如果有字幕，使用 Gemini 分析文本内容
            from app.services.ai_service import ai_service
            
            print(f"🤖 使用 Gemini 分析字幕内容...")
            
            # 构建分析提示
            analysis_prompt = f"""请分析以下 YouTube 视频字幕内容：

视频标题：{metadata['title']}
视频描述：{metadata.get('description', '')[:200]}...

字幕内容：
{transcript[:2000]}...

请提供：
1. **内容摘要**：简要概括主要内容（100-200字）
2. **关键主题**：列出3-5个核心主题
3. **核心观点**：提取3-5个关键观点或要点

"""
            
            if enhancement_prompt:
                analysis_prompt += f"\n特别关注：{enhancement_prompt}\n"
            
            analysis_prompt += """
请以 JSON 格式返回：
{
  "summary": "内容摘要...",
  "topics": ["主题1", "主题2", "主题3"],
  "insights": ["观点1", "观点2", "观点3"]
}

CRITICAL: 直接返回 JSON，不要包含 markdown 代码块标记
"""
            
            analysis_text = ai_service._call_gemini_api(analysis_prompt, temperature=0.3, max_tokens=2000)
            
            # 解析 JSON
            import json
            analysis_text = analysis_text.strip()
            if analysis_text.startswith("```json"):
                analysis_text = analysis_text[7:]
            if analysis_text.startswith("```"):
                analysis_text = analysis_text[3:]
            if analysis_text.endswith("```"):
                analysis_text = analysis_text[:-3]
            analysis_text = analysis_text.strip()
            
            analysis = json.loads(analysis_text)
            
            return {
                'transcript': transcript,
                'summary': analysis.get('summary', ''),
                'topics': analysis.get('topics', []),
                'insights': analysis.get('insights', []),
                'metadata': metadata,
                'source': source,
                'duration': metadata['duration']
            }
        
        except Exception as e:
            print(f"❌ YouTube 内容提取失败: {e}")
            raise Exception(f"无法从 YouTube 提取内容: {str(e)}")


# 创建全局实例
youtube_extractor = YouTubeExtractor()

