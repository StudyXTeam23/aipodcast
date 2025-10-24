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
  const pollIntervalRef = useRef(null);
  const navigate = useNavigate();

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

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

    // 清理旧的定时器
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        attempts++;
        const response = await podcastAPI.getJobStatus(jobId);
        
        if (response && response.status === 'completed') {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setProcessingStatus('Completed! Redirecting...');
          setTimeout(() => {
            navigate(`/podcast/${podcastId}`);
          }, 1000);
        } else if (response && response.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setError(`Generation failed: ${response.error_message || 'Please try again later'}`);
          setGenerating(false);
        } else if (response) {
          // Update processing status with detailed message
          let progressText = 'Generating...';
          if (response.status_message) {
            // Use the detailed status message from backend
            progressText = response.status_message;
            if (response.progress) {
              progressText += ` (${response.progress}%)`;
            }
          } else if (response.progress) {
            // Fallback to simple progress percentage
            progressText = `Generating... (${response.progress}%)`;
          }
          setProcessingStatus(progressText);
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setError('Generation timeout. Please check your podcast library or try again later');
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={generating}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
            generating
              ? 'bg-gray-600 cursor-not-allowed opacity-60'
              : 'bg-primary text-gray-900 hover:bg-primary/90 hover:shadow-lg'
          }`}
        >
          {generating ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="img" aria-label="Loading spinner">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{processingStatus || 'Generating...'}</span>
            </span>
          ) : (
            'Generate Podcast'
          )}
        </button>

        {/* Description Text */}
        {!generating && (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            AI will generate a complete podcast script and convert it to audio (takes 1-2 minutes)
          </p>
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

