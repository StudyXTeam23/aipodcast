import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { podcastAPI } from '../services/api';

const YouTubeForm = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [style, setStyle] = useState('Conversation');
  const [language, setLanguage] = useState('en');
  const [durationMinutes, setDurationMinutes] = useState(5);  // 确保是数字类型
  const [enhancementPrompt, setEnhancementPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const pollIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const navigate = useNavigate();

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

  const validateYoutubeUrl = (url) => {
    if (!url.trim()) {
      return 'Please enter a YouTube URL';
    }
    
    // YouTube URL 正则验证
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
    if (!youtubeRegex.test(url.trim())) {
      return 'Invalid YouTube URL. Please enter a valid YouTube video link.';
    }
    
    return null;
  };

  const pollJobStatus = async (jobId, podcastId) => {
    const maxAttempts = 600; // 最多轮询 10 分钟
    let attempts = 0;

    // 开始计时
    startTimeRef.current = Date.now();
    setElapsedTime(0);

    // 清理旧的定时器
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
    }

    // 启动已用时间计时器
    elapsedTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

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
          setError(response.error_message || 'Generation failed. Please try again.');
          setGenerating(false);
          setProgress(0);
        } else if (response && response.status === 'processing') {
          // 更新进度和状态
          const currentProgress = response.progress || 0;
          setProgress(currentProgress);
          setProcessingStatus(response.status_message || 'Processing...');

          // 计算预估剩余时间（基于当前进度）
          if (currentProgress > 5 && startTimeRef.current) {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const estimatedTotal = (elapsed / currentProgress) * 100;
            const remaining = Math.max(0, Math.ceil(estimatedTotal - elapsed));
            setEstimatedTime(remaining);
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          clearInterval(elapsedTimerRef.current);
          pollIntervalRef.current = null;
          elapsedTimerRef.current = null;
          setError('Processing timeout. Please check your podcast library.');
          setGenerating(false);
          setProgress(0);
        }
      } catch (err) {
        console.error('Polling error:', err);
        attempts++;
        if (attempts >= 3) {
          clearInterval(pollIntervalRef.current);
          clearInterval(elapsedTimerRef.current);
          pollIntervalRef.current = null;
          elapsedTimerRef.current = null;
          setError('Failed to check generation status. Please try again.');
          setGenerating(false);
          setProgress(0);
        }
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证输入
    const validationError = validateYoutubeUrl(youtubeUrl);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setGenerating(true);
    setProgress(0);
    setProcessingStatus('🎬 Fetching YouTube video...');

    try {
      const response = await podcastAPI.generateFromYouTube({
        youtubeUrl: youtubeUrl.trim(),
        style,
        language,
        durationMinutes: parseInt(durationMinutes),
        enhancementPrompt: enhancementPrompt.trim() || undefined,
      });

      console.log('✅ YouTube API 完整响应:', response);
      console.log('✅ YouTube API response.data:', response.data);
      console.log('   podcast_id:', response.data?.podcast_id);
      console.log('   job_id:', response.data?.job_id);
      console.log('   类型检查:', typeof response.data);

      // 提取数据（兼容不同的响应结构）
      const data = response.data || response;
      
      if (data && data.podcast_id && data.job_id) {
        console.log('🎯 开始轮询任务状态:', data.job_id);
        setProcessingStatus('📥 Extracting content from YouTube...');
        setProgress(5);
        await pollJobStatus(data.job_id, data.podcast_id);
      } else {
        console.error('❌ 响应缺少必要字段:', data);
        console.error('   完整响应对象:', response);
        setError('Invalid response from server. Please try again.');
        setGenerating(false);
        setProgress(0);
      }
    } catch (err) {
      console.error('❌ YouTube 生成错误:', err);
      console.error('   错误详情:', err.response?.data);
      setError(
        err.response?.data?.detail || 
        'Failed to start generation. Please check the YouTube URL and try again.'
      );
      setGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto">
      {!generating ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-md">
          {/* YouTube URL Input */}
          <div>
            <label htmlFor="youtube-url" className="block text-xs sm:text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
              🔗 YouTube Video URL
            </label>
            <input
              id="youtube-url"
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-sm sm:text-base"
              disabled={generating}
            />
          </div>

          {/* Style Selection */}
          <div>
            <label htmlFor="style" className="block text-xs sm:text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
              🎭 Podcast Style
            </label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-sm sm:text-base"
              disabled={generating}
            >
              {STYLE_OPTIONS.map((styleOption) => (
                <option key={styleOption} value={styleOption}>
                  {styleOption}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selection */}
          <div>
            <label htmlFor="language" className="block text-xs sm:text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
              🌐 Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-sm sm:text-base"
              disabled={generating}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Selection */}
          <div>
            <label htmlFor="duration" className="block text-xs sm:text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
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
              className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-accent-pink transition-colors"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
              }}
              disabled={generating}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>3 min</span>
              <span>9 min</span>
              <span>15 min</span>
            </div>
          </div>

          {/* Enhancement Prompt */}
          <div>
            <label htmlFor="enhancement" className="block text-xs sm:text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
              💡 Enhancement Prompt (Optional)
            </label>
            <textarea
              id="enhancement"
              value={enhancementPrompt}
              onChange={(e) => setEnhancementPrompt(e.target.value)}
              placeholder="e.g., Focus on technical details, include practical examples..."
              rows="3"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-sm sm:text-base resize-none"
              disabled={generating}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generating}
            className="w-full bg-gradient-to-r from-primary to-accent-lime text-gray-900 font-bold py-3 sm:py-4 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
          >
            {generating ? '🎬 Generating...' : '🚀 Generate Podcast from YouTube'}
          </button>
        </form>
      ) : (
        // Processing Status Display
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              🎬 Creating Your YouTube Podcast
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {processingStatus}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-accent-pink to-accent-purple rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span>{progress}%</span>
              <span>Processing</span>
            </div>
          </div>

          {/* Time Information */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold">⏱️ Elapsed:</span>
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
            {estimatedTime !== null && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">⏳ Estimated:</span>
                <span className="font-mono">{formatTime(estimatedTime)}</span>
              </div>
            )}
          </div>

          {/* Hint */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-500 italic">
            💡 This may take 2-5 minutes depending on video length. Feel free to explore other pages.
          </p>
        </div>
      )}
    </div>
  );
};

export default YouTubeForm;

