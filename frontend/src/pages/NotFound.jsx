import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#221910] font-display">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-black text-primary mb-4">404</h1>
            <h2 className="text-4xl font-bold text-[#1b140d] dark:text-[#f3ede7] mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary text-gray-900 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;

