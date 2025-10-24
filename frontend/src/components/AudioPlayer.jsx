import { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ audioUrl }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 重置状态
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const updateDuration = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
        console.log('✅ Duration updated:', audio.duration);
      } else {
        console.log('⚠️ Duration not ready:', audio.duration);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleCanPlay = () => {
      updateDuration();
    };

    const handleLoadedData = () => {
      updateDuration();
    };

    const handleError = (e) => {
      console.error('Audio loading error:', e);
    };

    const handleLoadStart = () => {
      console.log('🔄 Audio loading...');
    };

    const handleProgress = () => {
      // 不需要在每次 progress 时都更新 duration
      // 会导致无限循环
    };

    // 添加多个事件监听器以确保duration正确加载
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // 强制加载音频元数据
    audio.load();
    
    // 定期检查 duration（某些浏览器需要延迟才能获取）
    const checkInterval = setInterval(() => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
        console.log('⏱️ Duration found via interval:', audio.duration);
        clearInterval(checkInterval);
      }
    }, 100);

    // 5秒后停止检查
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]); // ✅ 移除 duration 依赖，只在 audioUrl 变化时重新初始化

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  };

  const handleProgressChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    if (!isNaN(newTime) && isFinite(newTime)) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skip = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = audio.currentTime + seconds;
    const maxTime = duration > 0 ? duration : audio.duration;
    
    // 检查 maxTime 是否有效
    if (!isFinite(maxTime) || maxTime <= 0) {
      console.warn('Cannot skip: audio duration not available');
      return;
    }
    
    audio.currentTime = Math.max(0, Math.min(maxTime, newTime));
    setCurrentTime(audio.currentTime);
  };

  const handleVolumeChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex flex-col gap-4">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
      />

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="text-white flex items-center justify-center rounded-full bg-primary shrink-0 h-12 w-12 hover:bg-primary/90 transition-colors"
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-grow flex flex-col gap-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, #ee8c2b 0%, #ee8c2b ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => skip(-10)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            title="Rewind 10s"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              <text x="9" y="16" fontSize="8" fill="white" fontWeight="bold">10</text>
            </svg>
          </button>
          <button
            onClick={() => skip(10)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            title="Forward 10s"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
              <text x="9" y="16" fontSize="8" fill="white" fontWeight="bold">10</text>
            </svg>
          </button>

          {/* Volume Control */}
          <div className="relative">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
              title="Volume"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                {volume === 0 ? (
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                ) : (
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                )}
              </svg>
            </button>
            {showVolumeSlider && (
              <div className="absolute bottom-full right-0 mb-2 p-2 bg-gray-700 rounded-lg shadow-lg">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  orient="vertical"
                  className="h-20 w-2 appearance-none bg-gray-600 rounded-full cursor-pointer"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;


