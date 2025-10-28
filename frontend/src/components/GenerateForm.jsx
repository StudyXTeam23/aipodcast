import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { podcastAPI } from '../services/api';

const GenerateForm = () => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('Solo Talk Show');
  const [language, setLanguage] = useState('en');
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [currentTip, setCurrentTip] = useState(0);
  const pollIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const navigate = useNavigate();

  // 播客小贴士
  const podcastTips = [
    "💡 Did you know? The first podcast was created in 2003 by Adam Curry and Dave Winer.",
    "🎙️ Tip: Clear audio quality can increase listener retention by up to 40%.",
    "📊 Fun fact: Over 2 million podcasts exist worldwide with 48 million episodes.",
    "⏱️ Studies show: The ideal podcast length is 20-40 minutes for maximum engagement.",
    "🎵 Pro tip: Adding background music can make your podcast 30% more engaging.",
    "🌍 Amazing: Podcasts are consumed in over 100 languages across the globe.",
    "📈 Growth: Podcast listeners have grown by 20% year-over-year since 2015.",
    "🎧 Insight: 80% of podcast listeners finish entire episodes they start.",
  ];

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    };
  }, []);

  // 提示轮换 - 每8秒切换一次
  useEffect(() => {
    if (!generating) return;
    
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % podcastTips.length);
    }, 8000);
    
    return () => clearInterval(tipInterval);
  }, [generating, podcastTips.length]);

  // 格式化时间显示（秒 -> MM:SS）
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const STYLE_OPTIONS = [
    'Solo Talk Show',
    'Conversation',
    'Storytelling'
  ];

  const LANGUAGE_OPTIONS = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const validateInput = () => {
    if (!topic.trim()) {
      return 'Please enter a podcast topic';
    }
    if (topic.trim().length < 5) {
      return 'Topic must be at least 5 characters';
    }
    if (topic.trim().length > 500) {
      return 'Topic cannot exceed 500 characters';
    }
    return null;
  };

  const pollJobStatus = async (jobId, podcastId) => {
    const maxAttempts = 600; // 最多轮询 10 分钟 (AI 生成和音频处理需要更长时间)
    let attempts = 0;

    // 清理旧的轮询定时器（计时器已在 handleSubmit 中启动）
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        attempts++;
        const response = await podcastAPI.getJobStatus(jobId);
        
        if (response && response.status === 'completed') {
          clearInterval(pollIntervalRef.current);
          clearInterval(elapsedTimerRef.current);
          pollIntervalRef.current = null;
          elapsedTimerRef.current = null;
          setProcessingStatus('✅ Completed! Redirecting...');
          setTimeout(() => {
            navigate(`/podcast/${podcastId}`);
          }, 1000);
        } else if (response && response.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          clearInterval(elapsedTimerRef.current);
          pollIntervalRef.current = null;
          elapsedTimerRef.current = null;
          setError(`Generation failed: ${response.error_message || 'Please try again later'}`);
          setGenerating(false);
        } else if (response) {
          // 更新处理进度和状态消息
          if (response.progress) {
            const currentProgress = response.progress;
            setProgress(currentProgress);
            
            // 改进的预估时间算法 - 基于阶段权重
            if (startTimeRef.current && currentProgress > 5) {
              const elapsed = (Date.now() - startTimeRef.current) / 1000;
              
              // 不同阶段的预估时间权重（AI Generate 相对更快）
              // 0-40%: 生成脚本（较快）- 60秒
              // 40-80%: 生成音频（较慢）- 90秒  
              // 80-100%: 上传和保存（快）- 10秒
              
              let estimatedTotal;
              if (currentProgress < 40) {
                // 前期阶段：预估总时间约 2.5 分钟
                estimatedTotal = 150;
              } else if (currentProgress < 80) {
                // 音频生成阶段：根据实际进度调整
                estimatedTotal = (elapsed / currentProgress) * 100;
                // 使用加权平均，避免剧烈波动
                estimatedTotal = estimatedTotal * 0.7 + 180 * 0.3;
              } else {
                // 最后阶段：快速完成
                estimatedTotal = (elapsed / currentProgress) * 100;
                estimatedTotal = Math.min(estimatedTotal, elapsed + 20);
              }
              
              const remaining = Math.max(5, Math.ceil(estimatedTotal - elapsed));
              setEstimatedTime(remaining);
            }
          }
          
          // 使用后端的详细状态消息
          if (response.status_message) {
            setProcessingStatus(response.status_message);
          } else {
            setProcessingStatus(`Generating... (${response.progress || 0}%)`);
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          clearInterval(elapsedTimerRef.current);
          pollIntervalRef.current = null;
          elapsedTimerRef.current = null;
          setError('Generation is taking longer than expected. The podcast may still be processing. Please check your podcast library in a few minutes.');
          setGenerating(false);
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setGenerating(true);
    setProgress(0);
    setProcessingStatus('Generating podcast script...');

    // 立即开始计时
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    setEstimatedTime(180); // 初始预估3分钟
    
    // 清理旧的定时器
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
    }
    
    // 启动已用时间计时器
    elapsedTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    try {
      const response = await podcastAPI.generate({
        topic: topic.trim(),
        style: style,
        duration_minutes: parseInt(durationMinutes),
        language: language
      });

      if (response && response.job_id && response.podcast_id) {
        setProcessingStatus('Script generation in progress...');
        // Start polling job status
        pollJobStatus(response.job_id, response.podcast_id);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message || 'AI generation failed. Please try again later');
      setGenerating(false);
      setProcessingStatus('');
      
      // 清理计时器
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
        elapsedTimerRef.current = null;
      }
    }
  };

  return (
    <div className="mt-6 sm:mt-10 max-w-2xl mx-auto min-h-[480px] sm:min-h-[520px] px-4 sm:px-0">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Topic Input */}
        <div>
          <label htmlFor="topic" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Podcast Topic *
          </label>
          <textarea
            id="topic"
            rows={4}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Enter podcast topic, e.g.: The Future of AI, Healthy Eating Habits, Travel Stories..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={generating}
            maxLength={500}
          />
          <div className="mt-1 text-xs text-gray-400 text-right">
            {topic.length}/500
          </div>
        </div>

        {/* Style Selector */}
        <div>
          <label htmlFor="style" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Podcast Style
          </label>
          <select
            id="style"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            disabled={generating}
          >
            {STYLE_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-gray-800">
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Language Selector */}
        <div>
          <label htmlFor="language" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            id="language"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={generating}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.code} value={option.code} className="bg-gray-800">
                {option.flag} {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* Duration Selection */}
        <div>
          <label htmlFor="duration" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ⏱️ Target Duration: <span className="text-primary font-bold">{durationMinutes}</span> minutes
          </label>
          <input
            id="duration"
            type="range"
            min="3"
            max="15"
            step="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:bg-accent-pink [&::-webkit-slider-thumb]:transition-colors [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:hover:bg-accent-pink [&::-moz-range-thumb]:transition-colors"
            disabled={generating}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>3 min</span>
            <span>9 min</span>
            <span>15 min</span>
          </div>
        </div>

        {/* Submit Button or Progress Display */}
        {!generating ? (
          <>
            <button
              type="submit"
              className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 bg-primary text-gray-900 hover:bg-primary/90 hover:shadow-lg"
            >
              Generate Podcast
            </button>
            
            {/* Description Text */}
            <p className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400 px-4">
              AI will generate a complete podcast script and convert it to audio (takes 1-2 minutes)
            </p>
          </>
        ) : (
          <div className="space-y-4">
            {/* 进度条 */}
            <div className="w-full">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-accent-purple h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              {/* 进度百分比 */}
              <p className="text-center mt-3 text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">
                {progress}%
              </p>
            </div>

            {/* 状态消息 */}
            <p className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 text-center px-4">
              {processingStatus || 'Generating...'}
            </p>

            {/* 时间信息 - 改进样式 */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
                <span className="font-semibold">⏱️ Elapsed:</span>
                <span className="font-mono font-bold text-primary">{formatTime(elapsedTime)}</span>
              </div>
              {estimatedTime !== null && estimatedTime > 0 && (
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
                  <span className="font-semibold">⏳ Remaining:</span>
                  <span className="font-mono font-bold text-accent-purple">{formatTime(estimatedTime)}</span>
                </div>
              )}
            </div>

            {/* 播客小贴士 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent-purple/10 rounded-xl border border-primary/20">
              <p className="text-sm sm:text-base text-center text-gray-700 dark:text-gray-200 italic animate-fade-in">
                {podcastTips[currentTip]}
              </p>
            </div>

            {/* 提示信息 */}
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center px-4">
              AI is generating your podcast. This may take a few minutes. Please keep this page open.
            </p>
          </div>
        )}
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default GenerateForm;

