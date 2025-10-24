import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { podcastAPI } from '../services/api';

const GenerateForm = () => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('Solo Talk Show');
  const [language, setLanguage] = useState('en');
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
          setError(`Generation failed: ${response.error_message || 'Please try again later'}`);
          setGenerating(false);
        } else if (response) {
          // 更新处理进度和状态消息
          if (response.progress) {
            setProgress(response.progress);
            
            // 根据进度估算剩余时间
            if (response.progress > 5) {
              const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
              const estimatedTotal = (elapsed / response.progress) * 100;
              const remaining = Math.max(0, Math.floor(estimatedTotal - elapsed));
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

    try {
      const response = await podcastAPI.generate({
        topic: topic.trim(),
        style: style,
        duration_minutes: 5,
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
    }
  };

  return (
    <div className="mt-10 max-w-2xl mx-auto min-h-[520px]">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Input */}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Podcast Topic *
          </label>
          <textarea
            id="topic"
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
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
          <label htmlFor="style" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Podcast Style
          </label>
          <select
            id="style"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
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
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            id="language"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
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

        {/* Submit Button or Progress Display */}
        {!generating ? (
          <>
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 bg-primary text-gray-900 hover:bg-primary/90 hover:shadow-lg"
            >
              Generate Podcast
            </button>
            
            {/* Description Text */}
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
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
              <p className="text-center mt-3 text-lg font-bold text-gray-700 dark:text-gray-300">
                {progress}%
              </p>
            </div>

            {/* 状态消息 */}
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 text-center">
              {processingStatus || 'Generating...'}
            </p>

            {/* 时间信息 */}
            <div className="flex gap-6 justify-center text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Elapsed: {formatTime(elapsedTime)}</span>
              </div>
              {estimatedTime !== null && estimatedTime > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Est. remaining: ~{formatTime(estimatedTime)}</span>
                </div>
              )}
            </div>

            {/* 提示信息 */}
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
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

