import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-700 px-3 sm:px-6 md:px-10 py-3">
      <div className="flex items-center gap-2 sm:gap-4 text-text-dark">
        <button 
          className="flex items-center gap-2 sm:gap-4 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0" 
          onClick={() => navigate('/')}
          aria-label="Go to homepage"
        >
          <div className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AIPodcast logo">
              <path
                clipRule="evenodd"
                d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-text-dark dark:text-text-dark text-base sm:text-lg font-bold leading-tight tracking-[-0.015em]">
            AIPodcast
          </h2>
        </button>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => navigate('/library')}
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 sm:h-10 px-2 sm:px-3 md:px-4 bg-gray-700 hover:bg-gray-600 text-white text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
        >
          <span className="truncate hidden sm:inline">My Podcasts</span>
          <span className="truncate sm:hidden">Library</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 sm:h-10 px-2 sm:px-3 md:px-4 bg-primary text-gray-900 text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
        >
          <span className="truncate hidden md:inline">Create new podcast</span>
          <span className="truncate md:hidden">Create</span>
        </button>
      </div>
    </header>
  );
};

export default Header;


