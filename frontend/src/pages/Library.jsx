import Header from '../components/Header';
import PodcastList from '../components/PodcastList';

function Library() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#221910] font-display text-[#1b140d] dark:text-[#f3ede7]">
      <Header />
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <main className="p-4 sm:p-6 md:p-10">
                <div className="flex flex-wrap justify-between gap-3 mb-6 sm:mb-8">
                  <p className="text-[#1b140d] dark:text-[#f3ede7] text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                    My podcasts
                  </p>
                </div>
                <PodcastList />
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Library;


