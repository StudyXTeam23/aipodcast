"""
YouTube 内容提取服务
使用 Gemini API 从 YouTube 视频提取内容（绕过 bot 检测）
"""
import tempfile
import os
from pathlib import Path
from typing import Dict, Any, Optional
import re
import json
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
        使用 Gemini API 获取 YouTube 视频元数据
        
        Args:
            url: YouTube 视频链接
        
        Returns:
            视频元数据字典
            {
                'title': str,
                'description': str,
                'duration': int,  # 秒（估计值）
                'uploader': str,
                'video_id': str
            }
        
        Raises:
            Exception: 如果提取失败
        """
        try:
            print(f"📹 使用 Gemini API 提取 YouTube 视频元数据...")
            print(f"   URL: {url}")
            
            # 使用 Gemini API 获取视频基本信息
            from app.services.ai_service import ai_service
            
            metadata_prompt = f"""Analyze this YouTube video and extract metadata in JSON format:

Video URL: {url}

Please provide:
1. Video title
2. Brief description (1-2 sentences)
3. Estimated duration in seconds (rough estimate from content)
4. Channel/uploader name

Return ONLY valid JSON with this exact structure:
{{
  "title": "video title here",
  "description": "brief description",
  "duration": 300,
  "uploader": "channel name"
}}

CRITICAL: Return ONLY the JSON, no markdown code blocks, no extra text."""

            # 调用 Gemini API（带视频 URL）
            response_text = ai_service._call_gemini_api_with_video(
                url=url,
                prompt=metadata_prompt,
                temperature=0.3,
                max_tokens=500
            )
            
            # 解析 JSON
            response_text = response_text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            metadata_json = json.loads(response_text)
            
            # 提取视频 ID
            video_id = self.extract_video_id(url) or "unknown"
            
            metadata = {
                'title': metadata_json.get('title', 'Unknown Title'),
                'description': metadata_json.get('description', ''),
                'duration': int(metadata_json.get('duration', 300)),  # 默认 5 分钟
                'uploader': metadata_json.get('uploader', 'Unknown'),
                'video_id': video_id,
                'upload_date': '',
                'view_count': 0,
                'thumbnail': f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg',
                'channel': metadata_json.get('uploader', 'Unknown'),
                'channel_id': ''
            }
            
            print(f"✅ 元数据提取成功（通过 Gemini API）")
            print(f"   标题: {metadata['title']}")
            print(f"   时长: {metadata['duration']} 秒（估计）")
            print(f"   作者: {metadata['uploader']}")
            
            return metadata
        
        except Exception as e:
            error_msg = str(e)
            print(f"❌ 元数据提取失败: {error_msg}")
            raise Exception(f"无法提取 YouTube 视频元数据: {error_msg}")
    
    def _extract_with_gemini(self, url: str, language: str = 'en', enhancement_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        使用 Gemini API 直接分析 YouTube 视频内容
        
        Args:
            url: YouTube 视频链接
            language: 目标语言
            enhancement_prompt: 可选的增强提示
        
        Returns:
            提取的内容和元数据
        """
        from app.services.ai_service import ai_service
        
        print(f"🤖 使用 Gemini API 分析视频内容...")
        
        # 构建分析提示
        analysis_prompt = f"""Analyze this YouTube video and provide comprehensive content extraction in JSON format.

Please provide:
1. **Transcript**: A detailed transcript or summary of the key content discussed in the video (focus on main points, insights, and information - at least 500 words)
2. **Summary**: A concise summary of the video (100-200 words)
3. **Topics**: List 3-5 main topics or themes discussed
4. **Insights**: List 3-5 key insights, takeaways, or important points

"""
        
        if enhancement_prompt:
            analysis_prompt += f"\nSpecial focus: {enhancement_prompt}\n"
        
        analysis_prompt += """
Return ONLY valid JSON with this exact structure:
{
  "transcript": "detailed content transcript or summary here...",
  "summary": "concise summary here...",
  "topics": ["topic1", "topic2", "topic3"],
  "insights": ["insight1", "insight2", "insight3"]
}

CRITICAL: Return ONLY the JSON, no markdown code blocks, no extra text."""

        # 调用 Gemini API（带视频 URL）
        response_text = ai_service._call_gemini_api_with_video(
            url=url,
            prompt=analysis_prompt,
            temperature=0.3,
            max_tokens=3000
        )
        
        # 解析 JSON
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        return json.loads(response_text)
    
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
                # 强力绕过 YouTube 的 bot 检测
                'nocheckcertificate': True,
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android', 'ios', 'web'],
                        'player_skip': ['webpage', 'configs'],
                        'skip': ['hls', 'dash'],
                    }
                },
                # 额外的绕过选项
                'age_limit': None,
                'no_check_certificate': True,
                'youtube_include_dash_manifest': False,
                'youtube_include_hls_manifest': False,
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
                # 强力绕过 YouTube 的 bot 检测
                'nocheckcertificate': True,
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android', 'ios', 'web'],
                        'player_skip': ['webpage', 'configs'],
                        'skip': ['hls', 'dash'],
                    }
                },
                # 额外的绕过选项
                'age_limit': None,
                'no_check_certificate': True,
                'youtube_include_dash_manifest': False,
                'youtube_include_hls_manifest': False,
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
        从 YouTube 视频提取内容（使用 Gemini API 直接分析）
        
        完全使用 Gemini 2.5 Pro/Flash 的视频分析能力，绕过 YouTube bot 检测
        
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
                'source': str,     # 'gemini_video_analysis'
                'duration': int
            }
        
        Raises:
            Exception: 如果提取失败
        """
        try:
            print(f"\n🎬 使用 Gemini API 分析 YouTube 视频...")
            
            # 1. 获取视频元数据（使用 Gemini）
            metadata = self.extract_metadata(url)
            
            # 2. 使用 Gemini API 直接分析视频内容
            content_analysis = self._extract_with_gemini(url, language, enhancement_prompt)
            
            print(f"✅ 视频内容分析完成！")
            print(f"   转录长度: {len(content_analysis.get('transcript', ''))} 字符")
            print(f"   主题数: {len(content_analysis.get('topics', []))} 个")
            
            return {
                'transcript': content_analysis.get('transcript', ''),
                'summary': content_analysis.get('summary', ''),
                'topics': content_analysis.get('topics', []),
                'insights': content_analysis.get('insights', []),
                'metadata': metadata,
                'source': 'gemini_video_analysis',
                'duration': metadata['duration']
            }
        
        except Exception as e:
            print(f"❌ YouTube 内容提取失败: {e}")
            raise Exception(f"无法从 YouTube 提取内容: {str(e)}")


# 创建全局实例
youtube_extractor = YouTubeExtractor()

