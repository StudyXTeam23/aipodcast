import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-700 px-4 sm:px-10 py-3">
      <div className="flex items-center gap-4 text-text-dark">
        <button 
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0" 
          onClick={() => navigate('/')}
          aria-label="Go to homepage"
        >
          <div className="h-6 w-6 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="EchoCast logo">
              <path
                clipRule="evenodd"
                d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-text-dark dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">
            EchoCast
          </h2>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/library')}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
        >
          <span className="truncate">My Podcasts</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-gray-900 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
        >
          <span className="truncate">Create new podcast</span>
        </button>
      </div>
    </header>
  );
};

export default Header;


