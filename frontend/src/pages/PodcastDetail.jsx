import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { podcastAPI } from '../services/api';
import Header from '../components/Header';
import AudioPlayer from '../components/AudioPlayer';
import Transcript from '../components/Transcript';

function PodcastDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPodcast = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await podcastAPI.getDetail(id);

      if (response) {
        setPodcast(response);
      } else {
        setError('Podcast not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load podcast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#221910] font-display">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#221910] font-display">
        <Header />
        <div className="max-w-[960px] mx-auto p-10">
          <div className="text-center py-10 px-4">
            <div className="text-red-500 dark:text-red-400 text-lg mb-4">
              {error || 'Podcast not found'}
            </div>
            <button
              onClick={() => navigate('/library')}
              className="px-6 py-2 bg-primary text-gray-900 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Back to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#221910] font-display text-[#1b140d] dark:text-[#f3ede7]">
      <Header />
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <main className="p-4 sm:p-10">
                {/* Back Button & Title */}
                <div className="flex items-center gap-2 mb-8">
                  <button
                    onClick={() => navigate('/library')}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <p className="text-[#1b140d] dark:text-[#f3ede7] text-4xl font-black leading-tight tracking-[-0.033em]">
                    {podcast.title || 'Untitled Podcast'}
                  </p>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-8">
                    {/* Audio Player */}
                    {podcast.status === 'completed' && podcast.audio_url ? (
                      <AudioPlayer audioUrl={podcast.audio_url} />
                    ) : (
                    <div className="bg-gray-800 rounded-lg p-6 text-center">
                      <p className="text-gray-400">
                        {podcast.status === 'processing'
                          ? 'Audio is being generated...'
                          : 'Audio not available'}
                      </p>
                    </div>
                  )}

                  {/* Transcript */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-[#1b140d] dark:text-[#f3ede7]">
                      Transcript
                    </h2>
                    <Transcript text={podcast.transcript || podcast.extracted_text} />
                  </div>

                  {/* Metadata */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                    <p>
                      <span className="font-semibold">Created:</span>{' '}
                      {new Date(podcast.created_at).toLocaleString()}
                    </p>
                    {podcast.original_filename && (
                      <p>
                        <span className="font-semibold">Original file:</span> {podcast.original_filename}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">Status:</span>{' '}
                      <span
                        className={
                          podcast.status === 'completed'
                            ? 'text-green-500'
                            : podcast.status === 'processing'
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }
                      >
                        {podcast.status}
                      </span>
                    </p>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PodcastDetail;

