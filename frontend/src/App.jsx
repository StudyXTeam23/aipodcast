import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';

// 首页直接导入（关键路径）
import LandingPage from './pages/LandingPage';

// 其他页面使用懒加载
const Library = lazy(() => import('./pages/Library'));
const PodcastDetail = lazy(() => import('./pages/PodcastDetail'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const NotFound = lazy(() => import('./pages/NotFound'));

// 加载中组件
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#FDEFE3] dark:bg-background-dark flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-gray-600 dark:text-gray-300 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/library" element={<Library />} />
          <Route path="/podcast/:id" element={<PodcastDetail />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Analytics />
    </Router>
  );
}

export default App;
