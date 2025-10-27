import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { podcastAPI } from '../services/api';

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [currentTip, setCurrentTip] = useState(0);
  const [style, setStyle] = useState('Conversation');
  const [language, setLanguage] = useState('en');
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [enhancementPrompt, setEnhancementPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
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
    if (!uploading) return;
    
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % podcastTips.length);
    }, 8000);
    
    return () => clearInterval(tipInterval);
  }, [uploading, podcastTips.length]);

  // 格式化时间显示（秒 -> MM:SS）
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 支持的文件类型（移除视频格式，视频现在通过 YouTube URL 处理）
  const ACCEPTED_TYPES = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
  ];

  const STYLE_OPTIONS = [
    'Solo Talk Show',
    'Conversation',
    'Storytelling'
  ];

  const LANGUAGE_OPTIONS = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const validateFile = (file) => {
    if (!file) {
      return 'Please select a file';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 100MB limit';
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Unsupported file type. Please upload text, PDF, or audio files.`;
    }

    return null;
  };

  const pollJobStatus = async (jobId, podcastId, isMediaFile = false) => {
    // 音频/视频分析需要更长时间（10分钟），文档处理2分钟
    const maxAttempts = isMediaFile ? 600 : 120;
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
        
        // 后端直接返回 job 对象
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
          setError(`Processing failed: ${response.error_message || 'Please try again.'}`);
          setUploading(false);
          setUploadProgress(0);
        } else if (response) {
          // 更新处理进度和状态消息
          if (response.progress) {
            setUploadProgress(response.progress);
            
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
            setProcessingStatus(`Processing: ${response.status}...`);
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          clearInterval(elapsedTimerRef.current);
          pollIntervalRef.current = null;
          elapsedTimerRef.current = null;
          setError('Processing is taking longer than expected. The podcast may still be processing. Please check your podcast library in a few minutes.');
          setUploading(false);
          setUploadProgress(0);
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    }, 1000);
  };

  const handleFileUpload = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

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
      // 自动检测：音频文件使用 AI 分析生成，文档文件使用原有流程
      const isMediaFile = file.type.startsWith('audio/');
      
      if (isMediaFile) {
        // 音频：使用 AI 分析并生成新播客
        setProcessingStatus('Uploading and analyzing with AI...');
        
        const response = await podcastAPI.analyzeAndGenerate(file, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(Math.min(progress, 50)); // 上传占 50%
          },
          style: style,
          durationMinutes: parseInt(durationMinutes),
          language: language,
          enhancementPrompt: enhancementPrompt.trim() || undefined,
        });

        if (response && response.job_id && response.podcast_id) {
          setProcessingStatus('AI analysis started! Generating podcast...');
          setUploadProgress(60);
          // 开始轮询任务状态（媒体文件需要更长超时）
          pollJobStatus(response.job_id, response.podcast_id, true);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        // 文档：普通上传流程
        setProcessingStatus('Uploading...');
        
        const response = await podcastAPI.upload(file, (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        });

        // 后端直接返回数据对象
        if (response && response.job_id && response.podcast_id) {
          setProcessingStatus('File uploaded! Processing...');
          // 开始轮询任务状态（文档文件）
          pollJobStatus(response.job_id, response.podcast_id, false);
        } else {
          throw new Error('Invalid response format');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to upload file');
      setUploading(false);
      setUploadProgress(0);
      setProcessingStatus('');
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError('');
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    handleFileUpload(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto">
      {!uploading ? (
        !selectedFile ? (
          // File Selection UI
          <div
            className={`relative flex flex-col items-center justify-center w-full h-56 sm:h-64 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
              isDragging
                ? 'border-accent-pink bg-accent-pink/10'
                : 'border-accent-pink/50 dark:border-accent-pink/70 bg-white/50 dark:bg-background-dark/50 hover:border-accent-pink'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
              <div className="flex space-x-4 sm:space-x-6 mb-4 text-gray-400 hover:text-accent-purple transition-colors duration-300">
                <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Document file icon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Audio file icon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="mb-2 text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 text-center">
                <span className="text-primary font-bold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-400 text-center">
                Text, PDF, DOC, or Audio files (Max 100MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              onChange={handleFileInputChange}
              accept=".txt,.pdf,.doc,.docx,.mp3,.wav"
              disabled={uploading}
            />
          </div>
        ) : (
          // Configuration Form UI
          <div className="space-y-6 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-md">
            {/* Selected File Display */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Selection (only for audio files) */}
            {selectedFile.type.startsWith('audio/') && (
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
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:bg-accent-pink [&::-webkit-slider-thumb]:transition-colors [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:hover:bg-accent-pink [&::-moz-range-thumb]:transition-colors"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>3 min</span>
                  <span>9 min</span>
                  <span>15 min</span>
                </div>
              </div>
            )}

            {/* Enhancement Prompt (only for audio files) */}
            {selectedFile.type.startsWith('audio/') && (
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
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-primary to-accent-lime text-gray-900 font-bold py-3 sm:py-4 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base"
            >
              🚀 Generate Podcast
            </button>
          </div>
        )
      ) : (
        // Processing Status Display
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              🎙️ Creating Your Podcast
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
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span>{uploadProgress}%</span>
              <span>Processing</span>
            </div>
          </div>

          {/* Time Information */}
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

          {/* Podcast Tips - Rotating */}
          <div className="bg-gradient-to-r from-primary/10 to-accent-purple/10 dark:from-primary/20 dark:to-accent-purple/20 border border-primary/20 dark:border-primary/30 rounded-xl p-4 transition-all duration-500">
            <p className="text-sm sm:text-base text-center text-gray-700 dark:text-gray-300 font-medium">
              {podcastTips[currentTip]}
            </p>
          </div>

          {/* Hint */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-500 italic">
            💡 This may take 2-5 minutes. Feel free to explore other pages.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

