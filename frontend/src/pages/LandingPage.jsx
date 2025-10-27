import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import YouTubeForm from '../components/YouTubeForm';
import GenerateForm from '../components/GenerateForm';
import Header from '../components/Header';

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'youtube', or 'generate'
  const navigate = useNavigate();

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'What is AIPODCAST?',
      answer: 'AIPODCAST is an AI Podcast Generator that transforms your existing content into high-quality podcasts using advanced artificial intelligence.',
    },
    {
      question: 'What file formats do you support?',
      answer: 'Our AI Podcast Generator supports a wide range of formats including .txt, .pdf, .doc, .mp3, .wav, .mp4, .mov, and YouTube video URLs.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a free trial that allows you to test our AI Podcast Generator with up to 10 minutes of content to see how AIPODCAST works.',
    },
    {
      question: 'How do you ensure data privacy?',
      answer: 'We take data privacy seriously. Your uploaded files are encrypted and processed securely by our AI Podcast Generator. We do not store your content after conversion unless you explicitly choose to save it.',
    },
  ];

  // 波形条配置（减少数量以提升性能）
  const waveformBars = [
    { height: 'h-16', delay: '-0.1s' },
    { height: 'h-24', delay: '-0.2s' },
    { height: 'h-12', delay: '-0.3s' },
    { height: 'h-32', delay: '-0.4s' },
    { height: 'h-20', delay: '-0.5s' },
    { height: 'h-16', delay: '-0.6s' },
    { height: 'h-28', delay: '-0.7s' },
    { height: 'h-10', delay: '-0.8s' },
    { height: 'h-24', delay: '-0.9s' },
    { height: 'h-14', delay: '-1.0s' },
    { height: 'h-20', delay: '-0.1s' },
    { height: 'h-32', delay: '-0.2s' },
    { height: 'h-12', delay: '-0.3s' },
    { height: 'h-24', delay: '-0.4s' },
    { height: 'h-16', delay: '-0.5s' },
    { height: 'h-28', delay: '-0.6s' },
    { height: 'h-10', delay: '-0.7s' },
    { height: 'h-20', delay: '-0.8s' },
    { height: 'h-32', delay: '-0.9s' },
    { height: 'h-14', delay: '-1.0s' },
  ];

  // 缓存描述文字以减少重新渲染
  const heroDescription = useMemo(() => {
    if (activeTab === 'upload') {
      return 'Transform any content into professional podcasts. Upload text, PDF, audio, or video files and let our AI Podcast Generator create engaging episodes instantly.';
    } else if (activeTab === 'youtube') {
      return 'Turn YouTube videos into podcasts. Paste a YouTube video URL and our AI Podcast Generator converts it into a professional podcast episode in minutes.';
    } else {
      return 'Create podcasts from ideas. Describe your podcast topic and our AI Podcast Generator will produce a complete script and studio-quality audio for you.';
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#FDEFE3] dark:bg-background-dark font-display text-text-light dark:text-text-dark">
      <Header />
      <main className="relative flex h-auto w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-6xl flex-1 px-4 sm:px-6 lg:px-8">
              {/* Hero Section with Waveform Background */}
              <div className="relative py-10 text-center bg-white dark:bg-gray-900/50 rounded-3xl overflow-hidden shadow-sm min-h-[600px]">
                {/* Waveform Background */}
                <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end justify-center space-x-2 p-4">
                    {waveformBars.map((bar, index) => (
                      <div
                        key={index}
                        className={`w-2 ${bar.height} bg-primary rounded-full animate-waveform`}
                        style={{ animationDelay: bar.delay }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 px-4 sm:px-6 lg:px-8">
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-purple will-change-transform">
                    AI Podcast Generator
                  </h1>
                  <p className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto text-gray-700 dark:text-gray-200 will-change-transform">
                    {heroDescription}
                  </p>

                  {/* Tab Switcher */}
                  <div className="flex justify-center mt-8 space-x-2 sm:space-x-4">
                    <button
                      onClick={() => setActiveTab('upload')}
                      className={`px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                        activeTab === 'upload'
                          ? 'bg-primary text-gray-900 shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      📁 File Upload
                    </button>
                    <button
                      onClick={() => setActiveTab('youtube')}
                      className={`px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                        activeTab === 'youtube'
                          ? 'bg-primary text-gray-900 shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      🎬 YouTube
                    </button>
                    <button
                      onClick={() => setActiveTab('generate')}
                      className={`px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                        activeTab === 'generate'
                          ? 'bg-primary text-gray-900 shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      🤖 AI Generate
                    </button>
                  </div>

                  {/* Dynamic Content Based on Tab */}
                  {activeTab === 'upload' && <FileUpload />}
                  {activeTab === 'youtube' && <YouTubeForm />}
                  {activeTab === 'generate' && <GenerateForm />}
                </div>
              </div>

              {/* Features Section */}
              <div className="py-16 bg-white dark:bg-background-dark rounded-2xl my-10 shadow-sm min-h-[400px]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-4xl font-extrabold text-center mb-12">Why Choose Our AI Podcast Generator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center p-4">
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-accent-pink to-accent-purple mb-5 shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="AI microphone icon representing voice synthesis technology">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-2">AI-Powered Voices</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Our AI-generated voices are natural and engaging, making your podcast sound professional.
                      </p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary to-blue-300 mb-5 shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Archive box icon representing multiple file format support">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Multi-Format Support</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Upload text, audio, or video files and we'll handle the rest.
                      </p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-accent-lime to-green-400 mb-5 shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <svg className="w-10 h-10 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Lightning bolt icon representing fast conversion speed">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Instant Conversion</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Go from content to podcast in minutes with our fast and efficient conversion process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-4xl font-extrabold text-center mb-12">How It Works</h2>
                  <div className="relative">
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-accent-pink via-primary to-accent-lime rounded-full -translate-y-1/2 opacity-30"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-white dark:bg-gray-800 mb-4 border-4 border-accent-pink shadow-xl relative">
                          <svg className="w-12 h-12 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Step 1: Cloud upload icon for file uploading">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <div className="absolute -top-3 -right-3 h-8 w-8 bg-accent-pink text-white font-bold text-lg rounded-full flex items-center justify-center">
                            1
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Upload Your Content</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          Drag and drop any text, audio, or video file to get started.
                        </p>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-white dark:bg-gray-800 mb-4 border-4 border-primary shadow-xl relative">
                          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Step 2: Light bulb icon representing AI processing and transformation">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <div className="absolute -top-3 -right-3 h-8 w-8 bg-primary text-white font-bold text-lg rounded-full flex items-center justify-center">
                            2
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">AI Transforms</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          Our AI analyzes and converts your content into a high-quality podcast.
                        </p>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-white dark:bg-gray-800 mb-4 border-4 border-accent-lime shadow-xl relative">
                          <svg className="w-12 h-12 text-accent-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Step 3: Download icon for saving and sharing podcast">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <div className="absolute -top-3 -right-3 h-8 w-8 bg-accent-lime text-gray-800 font-bold text-lg rounded-full flex items-center justify-center">
                            3
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Download & Share</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          Download your podcast and share it with your audience.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="py-16 max-w-3xl mx-auto">
                <h2 className="text-4xl font-extrabold text-center mb-8">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-transparent hover:border-primary transition-all shadow-sm"
                    >
                      <button
                        className="flex items-center justify-between w-full text-left"
                        onClick={() => toggleFaq(index)}
                      >
                        <h3 className="text-lg font-semibold">{faq.question}</h3>
                        <svg
                          className={`w-6 h-6 text-primary transition-transform duration-300 ${
                            openFaq === index ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          role="img"
                          aria-label={openFaq === index ? "Collapse answer" : "Expand answer"}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openFaq === index ? 'max-h-96 mt-4' : 'max-h-0'
                        }`}
                      >
                        <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <footer className="py-10 text-center border-t border-border-light dark:border-border-dark mt-10">
                <div className="flex justify-center gap-6 mb-4">
                  <button 
                    onClick={() => navigate('/terms-of-service')}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer font-medium"
                  >
                    Terms of Service
                  </button>
                  <button 
                    onClick={() => navigate('/privacy-policy')}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer font-medium"
                  >
                    Privacy Policy
                  </button>
                  <button 
                    onClick={() => navigate('/contact')}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer font-medium"
                  >
                    Contact Us
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  © 2025 StudyX. All rights reserved.
                </p>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;


