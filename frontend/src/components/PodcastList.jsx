import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { podcastAPI } from '../services/api';

const PodcastList = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;  // 每页10条
  const navigate = useNavigate();

  useEffect(() => {
    fetchPodcasts();
  }, []);

  useEffect(() => {
    // 实时搜索过滤
    if (searchQuery.trim() === '') {
      setFilteredPodcasts(podcasts);
    } else {
      const filtered = podcasts.filter((podcast) =>
        podcast.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPodcasts(filtered);
    }
    setCurrentPage(1); // 重置到第一页
  }, [searchQuery, podcasts]);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await podcastAPI.getList();
      
      // 后端返回的是数组
      if (Array.isArray(response)) {
        setPodcasts(response);
        setFilteredPodcasts(response);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      setError(err.message || 'Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = (podcastId) => {
    navigate(`/podcast/${podcastId}`);
  };

  const handleDownloadClick = async (podcastId) => {
    try {
      const response = await podcastAPI.getDownloadLink(podcastId);
      // 后端直接返回包含 download_url 的对象
      if (response && response.download_url) {
        // 创建临时链接触发下载而不是打开新标签页
        const link = document.createElement('a');
        link.href = response.download_url;
        link.download = ''; // 使用服务器提供的文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download podcast');
    }
  };

  const handleShareClick = (podcastId) => {
    const shareUrl = `${window.location.origin}/podcast/${podcastId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  const handleDeleteClick = async (podcastId) => {
    if (!confirm('Are you sure you want to delete this podcast? This action cannot be undone.')) {
      return;
    }

    try {
      await podcastAPI.delete(podcastId);
      // Refresh the podcast list
      fetchPodcasts();
      alert('Podcast deleted successfully!');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete podcast: ' + (err.message || 'Unknown error'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // 分页计算
  const totalPages = Math.ceil(filteredPodcasts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPodcasts = filteredPodcasts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4">
        <div className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</div>
        <button
          onClick={fetchPodcasts}
          className="px-6 py-2 bg-primary text-gray-900 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      {podcasts.length > 0 && (
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search podcasts..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      {/* Empty State */}
      {filteredPodcasts.length === 0 ? (
        <div className="text-center py-20 px-10 border-2 border-dashed border-gray-700 rounded-xl mt-8">
          <div className="flex justify-center items-center mb-4">
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {searchQuery ? 'No podcasts found' : 'Your Podcast Library is Empty'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? 'Try a different search term'
              : 'Start by converting your first file into a high-quality podcast.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/')}
              className="mx-auto px-6 py-3 bg-primary text-gray-900 rounded-lg text-base font-bold hover:bg-primary/90 transition-colors"
            >
              Create Your First Podcast
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Podcast List */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {currentPodcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-background-dark px-3 sm:px-4 py-3 sm:py-2 sm:min-h-[72px] justify-between border border-transparent hover:border-gray-700 rounded-lg transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-grow w-full sm:w-auto">
                  <button
                    onClick={() => handlePlayClick(podcast.id)}
                    className="text-white flex items-center justify-center rounded-lg bg-gray-800 shrink-0 h-10 w-10 sm:h-12 sm:w-12 hover:bg-primary/20 transition-colors"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <div className="flex flex-col justify-center flex-grow min-w-0">
                    <p className="text-white text-sm sm:text-base font-medium leading-normal truncate">
                      {podcast.title || 'Untitled Podcast'}
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm font-normal leading-normal">
                      Created: {formatDate(podcast.created_at)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
                  {podcast.status === 'completed' && (
                    <>
                      <button
                        onClick={() => handleDownloadClick(podcast.id)}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                        title="Download"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleShareClick(podcast.id)}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                        title="Share"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(podcast.id)}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-red-800 transition-colors text-gray-400 hover:text-red-400"
                        title="Delete"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                  {podcast.status === 'processing' && (
                    <>
                      <span className="text-xs sm:text-sm text-yellow-500 font-medium mr-1 sm:mr-2">Processing...</span>
                      <button
                        onClick={() => handleDeleteClick(podcast.id)}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-red-800 transition-colors text-gray-400 hover:text-red-400"
                        title="Delete processing podcast"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                  {podcast.status === 'failed' && (
                    <>
                      <span className="text-xs sm:text-sm text-red-500 font-medium mr-1 sm:mr-2">Failed</span>
                      <button
                        onClick={() => handleDeleteClick(podcast.id)}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-red-800 transition-colors text-gray-400 hover:text-red-400"
                        title="Delete failed podcast"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PodcastList;

