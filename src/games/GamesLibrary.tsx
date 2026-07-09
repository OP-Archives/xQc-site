import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { type LoaderFunctionArgs, useSearchParams, useLocation } from 'react-router-dom';
import type SimpleBarCore from 'simplebar-core';
import SimpleBar from 'simplebar-react';
import { getGamesLibrary } from '../utils/archive-client';
import type { LibraryGameItem } from '../utils/archive-client';
import Footer from '../utils/Footer';
import Loading from '../utils/Loading';
import PaginationControls from '../utils/PaginationControls';
import { queryClient } from '../utils/queryClient';
import AdSenseBanner from '../utils/AdSenseBanner';
import { useGamesLibrary, prefetchNextPageGamesLibrary } from '../utils/useGamesLibrary';
import { useMediaQuery } from '../utils/useMediaQuery';
import GameCard from './GameCard';

export const gamesLibraryLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('search') || '';
  const sort = url.searchParams.get('sort') || 'recent';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = 20;

  const apiSort = sort === 'recent' ? 'recent' : sort === 'game_name' ? 'game_name' : 'count';
  const queryKeyParams = {
    page,
    limit,
    ...(searchTerm.length > 0 ? { game_name: searchTerm } : {}),
    sort: apiSort,
    order: sort === 'game_name' ? 'asc' : 'desc',
  };

  await queryClient.ensureQueryData({
    queryKey: ['games-library', queryKeyParams],
    queryFn: ({ signal }: { signal: AbortSignal }) => getGamesLibrary({ ...queryKeyParams, signal }),
    staleTime: 5 * 60 * 1000,
  });

  return null;
};

const FILTERS = ['Recently Played', 'Most Played', 'Game Name'];

export default function GamesLibrary() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const location = useLocation();

  const scrollRef = useRef<SimpleBarCore | null>(null);

  const searchTerm = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'recent';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = isMobile ? 10 : 20;

  const [inputSearch, setInputSearch] = useState(searchTerm);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!isTypingRef.current) {
      setInputSearch(searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    const el = scrollRef.current?.getScrollElement();
    if (!el) return;

    const savedScroll = sessionStorage.getItem(`scroll-${location.key}`);

    if (savedScroll) {
      el.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
    } else {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }

    let scrollTimeout: number;

    const handleScroll = () => {
      if (scrollTimeout) window.clearTimeout(scrollTimeout);

      scrollTimeout = window.setTimeout(() => {
        sessionStorage.setItem(`scroll-${location.key}`, el.scrollTop.toString());
      }, 150);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) window.clearTimeout(scrollTimeout);
    };
  }, [page, location.key]);

  const updateUrlParams = (updates: Record<string, string | null>) => {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);

        for (const [key, val] of Object.entries(updates)) {
          if (val) nextParams.set(key, val);
          else nextParams.delete(key);
        }
        return nextParams;
      },
      { replace: true }
    );
  };

  const apiSort = sort === 'recent' ? 'recent' : sort === 'game_name' ? 'game_name' : 'count';
  const displaySort = sort === 'recent' ? 'Recently Played' : sort === 'game_name' ? 'Game Name' : 'Most Played';

  const queryKeyParams = {
    page,
    limit,
    ...(searchTerm.length > 0 ? { game_name: searchTerm } : {}),
    sort: apiSort,
    order: sort === 'game_name' ? 'asc' : 'desc',
  };

  const { data, isLoading, isFetching } = useGamesLibrary(queryKeyParams);
  const games = data?.data ?? null;
  const totalGames = data?.meta?.total ?? null;
  const totalPages = Math.ceil((totalGames || 0) / limit);
  const isBackgroundFetching = isFetching && !isLoading;

  const paginationParams = {
    ...(searchTerm ? { search: searchTerm } : {}),
    sort,
  };

  useEffect(() => {
    if (totalPages !== null && page < totalPages) {
      prefetchNextPageGamesLibrary(queryClient, { ...queryKeyParams, page: page + 1 });
    }
  }, [page, totalPages, queryKeyParams, queryClient]);

  const changeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const apiValue = newSort === 'Recently Played' ? 'recent' : newSort === 'Game Name' ? 'game_name' : 'count';
    updateUrlParams({ sort: apiValue, page: '1' });
  };

  const handleClearSearch = () => {
    setInputSearch('');
    updateUrlParams({ search: null, page: '1' });
  };

  return (
    <SimpleBar ref={scrollRef} className="min-h-0 h-full overflow-x-hidden">
      <div className="p-2 md:p-4 py-1 max-w-full">
        <AdSenseBanner />
        <div className="flex justify-center mt-2 flex-col items-center">
          {totalGames !== null && (
            <h4 className="text-primary text-3xl uppercase font-medium">{`${totalGames} Total Games`}</h4>
          )}
        </div>
        <div className="max-w-[1100px] mx-auto">
          <div className="flex justify-between items-center py-1 pb-2 gap-2">
            <div className="w-52 relative">
              <input
                type="text"
                placeholder="Search by Game Name"
                onChange={(e) => {
                  isTypingRef.current = true;
                  setInputSearch(e.target.value);
                  updateUrlParams({ search: e.target.value, page: '1' });
                  setTimeout(() => {
                    isTypingRef.current = false;
                  }, 500);
                }}
                value={inputSearch}
                className="w-full bg-dark-light border border-gray-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 pr-8"
              />
              {inputSearch && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <select
              value={displaySort}
              onChange={changeFilter}
              className="mt-1 sm:mt-0 bg-dark-light border border-gray-600 rounded px-3 py-1.5 text-sm w-max"
            >
              {FILTERS.map((data) => (
                <option key={data} value={data}>
                  {data}
                </option>
              ))}
            </select>
          </div>
          {isLoading && <Loading />}

          {!isLoading && games && games.length === 0 && (
            <p className="mt-12 text-center text-gray-400 text-sm">No library games found matching your search text.</p>
          )}

          {games && games.length > 0 && (
            <>
              <div
                className={`mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 transition-opacity duration-200 ${isBackgroundFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
              >
                {games.map((game: LibraryGameItem) => (
                  <GameCard
                    key={game.game_id}
                    game_id={game.game_id}
                    name={game.game_name}
                    image={game.chapter_image}
                    count={game.count}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <PaginationControls
          page={page}
          totalPages={totalPages}
          preserveParams={paginationParams}
          onHoverPage={(targetPage) =>
            prefetchNextPageGamesLibrary(queryClient, { ...queryKeyParams, page: targetPage })
          }
        />
        <AdSenseBanner />
      </div>
      <Footer />
    </SimpleBar>
  );
}
