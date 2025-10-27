"""
AI 服务 - ElevenLabs TTS + Gemini AI
使用 ElevenLabs API 将文本转换为语音
使用 Gemini API 生成播客稿件
"""
from elevenlabs.client import ElevenLabs
from app.config import settings
import io
import httpx
import json


class AIService:
    """AI 服务类 - 文本转语音 + AI 生成"""
    
    def __init__(self):
        """初始化 ElevenLabs 和 Gemini 客户端"""
        # ElevenLabs 配置
        self.client = ElevenLabs(
            api_key=settings.elevenlabs_api_key
        )
        self.voice_id = settings.elevenlabs_voice_id
        self.model_id = settings.elevenlabs_model_id
        self.output_format = settings.elevenlabs_output_format
        
        # 多语言语音映射
        # 从 ElevenLabs API 选择的高质量对话声音
        self.voice_mappings = {
            "en": {
                "primary": "CwhRBWXzGAHq8TQ4Fs17",   # Roger - 男声, classy, perfect for casual conversations
                "secondary": "21m00Tcm4TlvDq8ikWAM"  # Rachel - 女声, personable, great for conversational use
            },
            "zh": {
                "primary": "CwhRBWXzGAHq8TQ4Fs17",   # Roger - 支持多语言
                "secondary": "9BWtsMINqrJLrRacOk9x"  # Aria - 支持多语言的女声
            }
        }
        
        # 语音质量参数设置 - 针对中文优化
        self.voice_settings = {
            "stability": 0.5,  # 稳定性：0.5 平衡自然度和一致性
            "similarity_boost": 0.75,  # 相似度增强：0.75 提高清晰度
            "style": 0.0,  # 风格强度（如果模型支持）
            "use_speaker_boost": True  # 使用说话者增强
        }
        
        # Gemini 配置
        self.gemini_api_key = settings.gemini_api_key
        self.gemini_model = settings.gemini_model
        self.gemini_api_url = settings.gemini_api_url
    
    def generate_podcast_audio(self, text: str, language: str = "en") -> bytes:
        """
        生成播客音频
        
        Args:
            text: 要转换为语音的文本
        
        Returns:
            音频数据（字节）
        
        Raises:
            Exception: 如果生成失败
        """
        try:
            print(f"🎙️  开始生成音频...")
            print(f"   文本长度: {len(text)} 字符")
            print(f"   语言: {language}")
            
            # 根据语言选择语音
            voice_id = self.voice_mappings.get(language, self.voice_mappings["en"])["primary"]
            print(f"   语音ID: {voice_id}")
            print(f"   模型: {self.model_id}")
            
            # 调用 ElevenLabs API（添加语音质量设置）
            from elevenlabs import VoiceSettings
            
            audio_generator = self.client.text_to_speech.convert(
                text=text,
                voice_id=voice_id,
                model_id=self.model_id,
                output_format=self.output_format,
                voice_settings=VoiceSettings(
                    stability=self.voice_settings["stability"],
                    similarity_boost=self.voice_settings["similarity_boost"],
                    use_speaker_boost=self.voice_settings["use_speaker_boost"]
                )
            )
            
            # 收集音频数据
            audio_data = b''
            for chunk in audio_generator:
                audio_data += chunk
            
            print(f"✅ 音频生成成功！大小: {len(audio_data)} bytes")
            return audio_data
        
        except Exception as e:
            print(f"❌ 音频生成失败: {e}")
            raise Exception(f"ElevenLabs API 调用失败: {str(e)}")
    
    def generate_conversation_audio(
        self, 
        text_segments: list[tuple[str, str]] = None
    ) -> bytes:
        """
        生成对话音频（多个说话者）
        
        Args:
            text_segments: [(text1, voice_id1), (text2, voice_id2), ...]
        
        Returns:
            音频数据（字节）
        """
        # TODO: 未来可以实现多说话者对话
        # 目前使用单一语音
        if text_segments:
            combined_text = " ".join([seg[0] for seg in text_segments])
            return self.generate_podcast_audio(combined_text)
        return b''
    
    def transcribe_audio(self, audio_content: bytes, filename: str) -> str:
        """
        使用 ElevenLabs 将音频转录为文本
        
        Args:
            audio_content: 音频文件内容（字节）
            filename: 文件名
        
        Returns:
            转录的文本
        
        Raises:
            Exception: 如果转录失败
        """
        try:
            print(f"🎤 开始转录音频...")
            print(f"   文件名: {filename}")
            print(f"   音频大小: {len(audio_content)} bytes")
            
            # 创建文件对象
            audio_file = io.BytesIO(audio_content)
            audio_file.name = filename
            
            # 调用 ElevenLabs speech-to-text API
            response = self.client.speech_to_text.convert(
                file=audio_file,
                model_id="scribe_v1"  # ElevenLabs 的转录模型（正确的模型ID）
            )
            
            # 提取转录文本
            if hasattr(response, 'text'):
                transcript = response.text
            elif isinstance(response, dict) and 'text' in response:
                transcript = response['text']
            else:
                transcript = str(response)
            
            print(f"✅ 音频转录成功！文本长度: {len(transcript)} 字符")
            return transcript
        
        except Exception as e:
            print(f"❌ 音频转录失败: {e}")
            raise Exception(f"ElevenLabs 转录 API 调用失败: {str(e)}")
    
    def _call_gemini_api_with_video(self, url: str, prompt: str, temperature: float = 0.7, max_tokens: int = 4000) -> str:
        """
        调用 Gemini API 分析视频（支持 YouTube URL）
        
        Args:
            url: YouTube 视频 URL
            prompt: 输入提示词
            temperature: 生成温度 (0.0-1.0)
            max_tokens: 最大输出 token 数
        
        Returns:
            生成的文本内容
        
        Raises:
            Exception: 如果 API 调用失败
        """
        try:
            # 使用 gemini-2.5-flash 或 gemini-2.5-pro 支持视频分析
            model = "gemini-2.0-flash-exp" if "flash" in self.gemini_model else self.gemini_model
            api_url = f"{self.gemini_api_url}/{model}:generateContent?key={self.gemini_api_key}"
            
            # 构建请求体（支持视频 URL）
            payload = {
                "contents": [{
                    "role": "user",  # ← 必须指定 role！
                    "parts": [
                        {"text": prompt},
                        {
                            "fileData": {
                                "fileUri": url
                            }
                        }
                    ]
                }],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens,
                    "topP": 0.95,
                    "topK": 40
                }
            }
            
            with httpx.Client(timeout=120.0) as client:
                response = client.post(
                    api_url,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
            
            result = response.json()
            
            if "candidates" not in result or not result["candidates"]:
                raise Exception("Gemini API 未返回有效内容")
            
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip()
        
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text
            raise Exception(f"Gemini API 调用失败 (HTTP {e.response.status_code}): {error_detail}")
        except Exception as e:
            raise Exception(f"Gemini API 调用异常: {str(e)}")
    
    def _call_gemini_api(self, prompt: str, temperature: float = 0.7, max_tokens: int = 4000) -> str:
        """
        调用 Gemini API 生成文本
        参考 TypeScript 模式: prepGo_tool/src/lib/ai-service.ts
        
        Args:
            prompt: 输入提示词
            temperature: 生成温度 (0.0-1.0)
            max_tokens: 最大输出 token 数
        
        Returns:
            生成的文本内容
        
        Raises:
            Exception: 如果 API 调用失败
        """
        try:
            # 构建 API URL (参考 TypeScript 第68行)
            url = f"{self.gemini_api_url}/{self.gemini_model}:generateContent?key={self.gemini_api_key}"
            
            # 构建请求体 (参考 TypeScript 第70-76行)
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens
                }
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            print(f"🤖 调用 Gemini API...")
            print(f"   模型: {self.gemini_model}")
            print(f"   提示词长度: {len(prompt)} 字符")
            
            # 发送 POST 请求
            response = httpx.post(
                url,
                json=payload,
                headers=headers,
                timeout=180.0  # 180秒超时（AI生成需要更长时间）
            )
            
            # 检查响应状态
            response.raise_for_status()
            
            # 解析响应 (参考 TypeScript 第83行)
            data = response.json()
            content = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            
            if not content:
                raise Exception("Gemini API 返回空响应")
            
            print(f"✅ Gemini API 调用成功！生成文本长度: {len(content)} 字符")
            return content
        
        except httpx.HTTPStatusError as e:
            error_msg = f"HTTP错误 {e.response.status_code}: {e.response.text}"
            print(f"❌ Gemini API 调用失败: {error_msg}")
            raise Exception(error_msg)
        except Exception as e:
            print(f"❌ Gemini API 调用异常: {e}")
            raise Exception(f"Gemini API 调用失败: {str(e)}")
    
    def generate_dialogue_audio(self, script: str, language: str = "en") -> bytes:
        """
        为对话生成多声音音频（使用 text_to_dialogue API）
        
        Args:
            script: 播客稿件（可能包含多个说话者）
            language: 语言代码 (en/zh)
        
        Returns:
            音频数据（字节）
        """
        try:
            from elevenlabs import DialogueInput
            
            print(f"🎭 开始生成多声音对话音频...")
            print(f"   语言: {language}")
            
            # 解析稿件，分离不同说话者
            dialogue_inputs = self._parse_dialogue_script(script, language)
            
            if len(dialogue_inputs) <= 1:
                # 如果只有一个说话者，使用普通TTS
                print("   检测到单人播客，使用标准TTS")
                return self.generate_podcast_audio(script, language)
            
            print(f"   检测到 {len(dialogue_inputs)} 段对话")
            
            # 使用 text_to_dialogue API
            # 注意：text_to_dialogue 不支持全局 voice_settings 参数
            # 语音设置需要在创建 DialogueInput 时单独配置
            audio_generator = self.client.text_to_dialogue.convert(
                inputs=dialogue_inputs,
                model_id=self.model_id,
                output_format=self.output_format
            )
            
            # 收集音频数据
            audio_data = b''
            for chunk in audio_generator:
                audio_data += chunk
            
            print(f"✅ 多声音音频生成成功！大小: {len(audio_data)} bytes")
            return audio_data
        
        except Exception as e:
            print(f"❌ 多声音音频生成失败: {e}")
            print("   回退到单声音TTS")
            return self.generate_podcast_audio(script, language)
    
    def _parse_dialogue_script(self, script: str, language: str) -> list:
        """
        解析对话稿件，分离不同说话者
        
        Args:
            script: 播客稿件
            language: 语言代码
        
        Returns:
            DialogueInput 列表
        """
        from elevenlabs import DialogueInput, VoiceSettings
        
        dialogue_inputs = []
        voices = self.voice_mappings.get(language, self.voice_mappings["en"])
        
        # 创建语音设置对象
        voice_settings = VoiceSettings(
            stability=self.voice_settings["stability"],
            similarity_boost=self.voice_settings["similarity_boost"],
            use_speaker_boost=self.voice_settings["use_speaker_boost"]
        )
        
        # 分行处理
        lines = script.strip().split('\n')
        current_speaker = None
        current_text = []
        
        # 识别模式：任何以 "名字:" 或 "名字：" 开头的行
        # 支持: Alex:, Ben:, Host A:, 主持人A：等所有格式
        import re
        # 匹配任意单词（可能包含空格）后跟冒号
        speaker_pattern = re.compile(r'^([A-Za-z\u4e00-\u9fa5][A-Za-z\u4e00-\u9fa5\s0-9]*?)[:：]\s*(.*)$')
        
        print(f"\n📋 开始解析对话脚本...")
        
        # 用于追踪说话者和分配语音
        speaker_voice_map = {}  # 说话者名字 -> voice_id
        speaker_order = []  # 记录说话者出现顺序
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            match = speaker_pattern.match(line)
            if match:
                # 保存前一个说话者的内容
                if current_text and current_speaker:
                    text = ' '.join(current_text).strip()
                    if text:
                        voice_id = speaker_voice_map[current_speaker]
                        print(f"   添加 {current_speaker} 声音: {text[:50]}...")
                        # 为每个对话段添加语音设置
                        dialogue_inputs.append(DialogueInput(
                            text=text, 
                            voice_id=voice_id,
                            voice_settings=voice_settings
                        ))
                
                # 开始新说话者，只提取冒号后的实际内容
                speaker_label = match.group(1).strip()
                actual_text = match.group(2).strip()  # 只取冒号后面的内容
                
                # 动态分配语音：第一个说话者用 primary，第二个用 secondary
                if speaker_label not in speaker_voice_map:
                    speaker_order.append(speaker_label)
                    if len(speaker_order) == 1:
                        speaker_voice_map[speaker_label] = voices["primary"]
                        print(f"   🎤 新说话者 '{speaker_label}' -> 使用 primary 声音")
                    elif len(speaker_order) == 2:
                        speaker_voice_map[speaker_label] = voices["secondary"]
                        print(f"   🎤 新说话者 '{speaker_label}' -> 使用 secondary 声音")
                    else:
                        # 超过2个说话者，循环使用
                        speaker_voice_map[speaker_label] = voices["primary"] if len(speaker_order) % 2 == 1 else voices["secondary"]
                        print(f"   🎤 新说话者 '{speaker_label}' -> 使用 {'primary' if len(speaker_order) % 2 == 1 else 'secondary'} 声音")
                
                current_speaker = speaker_label
                
                # ⚠️ 重要：这里确保不包含说话者标签，只保留实际对话内容
                if actual_text:
                    current_text = [actual_text]
                    print(f"   ✅ 提取内容（不含'{speaker_label}:'标签）: {actual_text[:50]}...")
                else:
                    current_text = []
                
                print(f"   检测到说话者: {speaker_label}")
            else:
                # 继续当前说话者的文本
                current_text.append(line)
        
        # 保存最后一个说话者的内容
        if current_text and current_speaker:
            text = ' '.join(current_text).strip()
            if text:
                voice_id = speaker_voice_map[current_speaker]
                print(f"   添加 {current_speaker} 声音: {text[:50]}...")
                # 为每个对话段添加语音设置
                dialogue_inputs.append(DialogueInput(
                    text=text, 
                    voice_id=voice_id,
                    voice_settings=voice_settings
                ))
        
        # 如果没有检测到多个说话者，整段作为单一输入
        if len(dialogue_inputs) == 0:
            # 尝试清除所有标签后再使用
            cleaned_script = re.sub(speaker_pattern, r'\2', script)
            dialogue_inputs.append(DialogueInput(
                text=cleaned_script.strip(),
                voice_id=voices["primary"],
                voice_settings=voice_settings
            ))
            print(f"   ⚠️  未检测到对话格式，使用单声音")
        else:
            print(f"✅ 解析完成，检测到 {len(speaker_order)} 个说话者，共 {len(dialogue_inputs)} 段对话")
        
        return dialogue_inputs
    
    def generate_script_from_topic(
        self, 
        topic: str, 
        style: str = "Solo Talk Show",
        duration_minutes: int = 5,
        language: str = "en"
    ) -> str:
        """
        根据主题生成播客稿件（两步法：大纲 → 完整稿件）
        
        Args:
            topic: 播客主题
            style: 播客风格（单人脱口秀/双人对话/故事叙述）
            duration_minutes: 目标时长（分钟）
        
        Returns:
            完整的播客稿件
        
        Raises:
            Exception: 如果生成失败
        """
        print(f"\n📝 开始生成播客稿件...")
        print(f"   主题: {topic}")
        print(f"   风格: {style}")
        print(f"   语言: {language}")
        print(f"   目标时长: {duration_minutes} 分钟")
        
        try:
            # 语言配置
            if language == "zh":
                outline_prompt = f"""你是一位专业的播客编剧。请为以下主题生成一个播客大纲。

主题：{topic}
风格：{style}
目标时长：{duration_minutes} 分钟

请生成一个包含以下部分的大纲：
1. 开场白（引人入胜的开场）
2. 主要内容点（3-5个核心要点）
3. 结尾（总结）

要求：
- 内容要有趣、引人入胜
- 适合{style}的表达方式
- 语言自然流畅、口语化
- 适合{duration_minutes}分钟的播客长度

请直接输出大纲内容，不要额外的解释。"""

                script_prompt_base = f"""你是一位专业的播客编剧。根据以下大纲，生成一份完整的播客稿件。

主题：{topic}
风格：{style}
目标时长：{duration_minutes} 分钟

大纲：
{{outline}}

请根据大纲生成完整的播客稿件：

要求：
1. 开场白要引人入胜，快速吸引听众注意力
2. 内容要详细展开，但保持节奏流畅
3. 使用{style}的表达方式和语气
4. 使用自然口语化的表达，避免书面语
5. 结尾要有力，给听众留下深刻印象
6. 总字数控制在 {duration_minutes * 200}-{duration_minutes * 300} 字左右
7. 对于对话风格，使用具体的主持人名字作为标签（如"Alex："、"Emma："），并在第一次说话时简短自我介绍

CRITICAL - 绝对禁止以下内容：
- 任何括号标注：(**音乐**) (**轻笑**) (**停顿**) （音乐起） [音效]
- 任何Markdown格式：**粗体** *斜体* 
- 占位符：[你的名字] [主持人名字]
- 音效、舞台指示、动作、场景描述
- 使用"主持人A"、"主持人B"这样的标签（要用真实名字）

正确示例（对话风格）：
Alex：嗨，大家好！我是Alex，欢迎收听今天的节目。
Emma：你好！我是Emma，很高兴来到这里。
Alex：今天我们要聊一个非常有趣的话题。
Emma：没错，让我们开始吧！

对话格式说明：
- 固定使用这两个名字："Alex"（男主持）和"Emma"（女主持）
- 每个主持人在第一句话中简短自我介绍（"我是Alex"、"我是Emma"）
- 后续对话中不需要重复名字
- 标签仅用于区分说话者，TTS时会被自动过滤
- Alex先说，Emma回应

请直接输出完整稿件。"""
            else:  # English
                outline_prompt = f"""You are a professional podcast scriptwriter. Generate a podcast outline for the following topic.

Topic: {topic}
Style: {style}
Target Duration: {duration_minutes} minutes

Generate an outline including:
1. Opening (captivating introduction)
2. Main content points (3-5 key points)
3. Closing (summary)

Requirements:
- Content should be interesting and engaging
- Match the {style} expression style
- Natural and conversational language
- Suitable for {duration_minutes} minutes podcast length

Output the outline directly without extra explanations."""

                script_prompt_base = f"""You are a professional podcast scriptwriter. Based on the following outline, generate a complete podcast script.

Topic: {topic}
Style: {style}
Target Duration: {duration_minutes} minutes

Outline:
{{outline}}

Generate a complete podcast script based on the outline:

Requirements:
1. Opening should be captivating and quickly grab the audience's attention
2. Content should be detailed but maintain smooth pacing
3. Use the expression style and tone of {style}
4. Use natural conversational language, avoid formal writing
5. Closing should be powerful and leave a lasting impression
6. Word count: {duration_minutes * 150}-{duration_minutes * 250} words
7. For conversation style, use REAL HOST NAMES as labels (like "Alex:", "Ben:", "Sarah:"), and have each host briefly introduce themselves in their FIRST line only

CRITICAL - ABSOLUTELY FORBIDDEN:
- Any bracketed annotations: (**music**) (**laughs**) (**pause**) (music starts) [sound effect]
- Any Markdown formatting: **bold** *italic*
- Placeholders: [your name] [host name]
- Sound effects, stage directions, actions, scene descriptions
- Using generic labels like "Host A", "Host B", "Speaker 1" (use real names instead)

CORRECT Example (Conversation style):
Mike: Hey everyone! I'm Mike, and welcome back to the show.
Sarah: Hi there! I'm Sarah, excited to be here today.
Mike: So Sarah, let's dive right into today's fascinating topic.
Sarah: Absolutely! This is going to be great.

Conversation format guidelines:
- ALWAYS use these EXACT names: "Mike" (male host) and "Sarah" (female host)
- Each host introduces themselves ONLY in their first line ("I'm Mike", "I'm Sarah")
- After introduction, just continue the conversation naturally
- Labels are for speaker identification and will be filtered during TTS
- Mike speaks first, Sarah responds

Output the complete script directly."""
            
            print("\n📋 步骤1: 生成大纲...")
            outline = self._call_gemini_api(outline_prompt, temperature=0.8, max_tokens=2000)
            print(f"✅ 大纲生成完成")
            
            # 步骤2: 根据大纲扩展为完整稿件
            script_prompt = script_prompt_base.replace("{outline}", outline)
            
            print("\n✍️  步骤2: 扩展为完整稿件...")
            script = self._call_gemini_api(script_prompt, temperature=0.7, max_tokens=4000)
            print(f"✅ 完整稿件生成完成")
            
            print(f"\n🎉 播客稿件生成成功！")
            print(f"   最终字数: {len(script)} 字符")
            
            return script
        
        except Exception as e:
            print(f"❌ 播客稿件生成失败: {e}")
            raise Exception(f"播客稿件生成失败: {str(e)}")


# 创建全局实例
ai_service = AIService()

