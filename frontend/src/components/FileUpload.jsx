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
  const fileInputRef = useRef(null);
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

  // 支持的文件类型
  const ACCEPTED_TYPES = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
    'video/mp4',
    'video/quicktime',
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
      return `Unsupported file type. Please upload text, audio, or video files.`;
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

    try {
      // 自动检测：音频/视频文件使用 AI 分析生成，文档文件使用原有流程
      const isMediaFile = file.type.startsWith('audio/') || file.type.startsWith('video/');
      
      if (isMediaFile) {
        // 音频/视频：使用 AI 分析并生成新播客
        setProcessingStatus('Uploading and analyzing with AI...');
        
        const response = await podcastAPI.analyzeAndGenerate(file, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(Math.min(progress, 50)); // 上传占 50%
          },
          style: 'Conversation',
          durationMinutes: 5,
          language: 'en',
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
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="mt-6 sm:mt-10 max-w-2xl mx-auto min-h-[280px] sm:min-h-[320px] px-4 sm:px-0">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-56 sm:h-64 min-h-[224px] sm:min-h-[256px] border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
          isDragging
            ? 'border-accent-pink bg-accent-pink/10'
            : 'border-accent-pink/50 dark:border-accent-pink/70 bg-white/50 dark:bg-background-dark/50 hover:border-accent-pink'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center p-6 w-full">
            <div className="w-full max-w-md mb-4">
              {/* 进度条 */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-accent-purple h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              {/* 进度百分比 */}
              <p className="text-center mt-3 text-lg font-bold text-gray-700 dark:text-gray-300">
                {uploadProgress}%
              </p>
            </div>

            {/* 状态消息 */}
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center max-w-md">
              {processingStatus}
            </p>

            {/* 时间信息 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Elapsed: {formatTime(elapsedTime)}</span>
              </div>
              {estimatedTime !== null && estimatedTime > 0 && (
                <div className="flex items-center gap-2 justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Est. remaining: ~{formatTime(estimatedTime)}</span>
                </div>
              )}
            </div>

            {/* 提示信息 */}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center max-w-md px-4">
              Processing large audio files may take several minutes. Please keep this page open.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
            <div className="flex space-x-4 sm:space-x-6 mb-4 text-gray-400 group-hover:text-accent-purple transition-colors duration-300">
              <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Document file icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Audio file icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Video file icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="mb-2 text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 text-center">
              <span className="text-primary font-bold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-400 text-center">
              Text, PDF, DOC, Audio, or Video (Max 100MB)
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          onChange={handleFileInputChange}
          accept=".txt,.pdf,.doc,.docx,.mp3,.wav,.mp4,.mov"
          disabled={uploading}
        />
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

