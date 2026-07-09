import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, X } from 'lucide-react';
import { useEffect, useState, useRef, startTransition } from 'react';
import { type LoaderFunctionArgs, useSearchParams, useLocation } from 'react-router-dom';
import type SimpleBarCore from 'simplebar-core';
import SimpleBar from 'simplebar-react';
import { listGames, type GameData } from '../utils/archive-client';
import Footer from '../utils/Footer';
import Loading from '../utils/Loading';
import PaginationControls from '../utils/PaginationControls';
import { queryClient } from '../utils/queryClient';
import { useGames, prefetchNextPageGames } from '../utils/useGames';
import AdSenseBanner from '../utils/AdSenseBanner';

import Game from './Game';

export const gamesLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter') || 'Default';
  const from = url.searchParams.get('from') || FORMATTED_START;
  const currentDayString = new Date().toISOString().split('T')[0];
  const to = url.searchParams.get('to') || currentDayString;
  const filterGame = url.searchParams.get('game') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const gameId = url.searchParams.get('game_id');
  const limit = 20;

  const memoizedDateRange = (() => {
    if (filter !== 'Date' || !from || !to) return null;
    try {
      return {
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
      };
    } catch {
      return null;
    }
  })();

  const queryKeyParams = {
    limit,
    page,
    sort: 'created_at',
    order: 'desc',
    ...(gameId ? { game_id: gameId } : {}),
    ...(memoizedDateRange ? memoizedDateRange : {}),
    ...(filter === 'Game' && filterGame ? { game_name: filterGame } : {}),
  };

  await queryClient.ensureQueryData({
    queryKey: ['games', queryKeyParams],
    queryFn: ({ signal }: { signal: AbortSignal }) => listGames({ ...queryKeyParams, signal }),
    staleTime: 5 * 60 * 1000,
  });

  return null;
};

const FILTERS = ['Default', 'Date', 'Game'];
const START_DATE = import.meta.env.VITE_START_DATE;

const FORMATTED_START = START_DATE ? new Date(START_DATE).toISOString().split('T')[0] : '';

export default function GamesPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const todayString = new Date().toISOString().split('T')[0];

  const scrollRef = useRef<SimpleBarCore | null>(null);

  const filter = searchParams.get('filter') || FILTERS[0];
  const filterStartDate = searchParams.get('from') || FORMATTED_START;
  const filterEndDate = searchParams.get('to') || todayString;
  const filterGame = searchParams.get('game') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const gameId = searchParams.get('game_id');
  const limit = 20;

  const memoizedDateRange = (() => {
    if (filter !== 'Date' || !filterStartDate || !filterEndDate) return null;
    try {
      return {
        from: new Date(filterStartDate).toISOString(),
        to: new Date(filterEndDate).toISOString(),
      };
    } catch {
      return null;
    }
  })();

  const [inputGame, setInputGame] = useState(filterGame);
  const [inputStartDate, setInputStartDate] = useState(filterStartDate);
  const [inputEndDate, setInputEndDate] = useState(filterEndDate);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputGame(filterGame);
  }, [filterGame]);
  useEffect(() => {
    setInputStartDate(filterStartDate);
  }, [filterStartDate]);
  useEffect(() => {
    setInputEndDate(filterEndDate);
  }, [filterEndDate]);

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
    startTransition(() => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);

          for (const [key, val] of Object.entries(updates)) {
            if (val) nextParams.set(key, val);
            else nextParams.delete(key);
          }
          if (gameId) nextParams.set('game_id', gameId);
          return nextParams;
        },
        { replace: true }
      );
    });
  };

  const queryKeyParams = {
    limit,
    page,
    sort: 'created_at',
    order: 'desc',
    ...(gameId ? { game_id: gameId } : {}),
    ...(memoizedDateRange ? memoizedDateRange : {}),
    ...(filter === 'Game' && filterGame ? { game_name: filterGame } : {}),
  };

  const { data, isLoading, isFetching } = useGames(queryKeyParams);
  const games = data?.data ?? null;
  const totalGames = data?.meta?.total ?? null;
  const totalPages = Math.ceil((totalGames || 0) / limit);
  const isBackgroundFetching = isFetching && !isLoading;

  const paginationParams = {
    ...(gameId ? { game_id: gameId } : {}),
    ...(filter !== 'Default' ? { filter } : {}),
    ...(filter === 'Date' ? { from: filterStartDate, to: filterEndDate } : {}),
    ...(filterGame ? { game: filterGame } : {}),
  };

  useEffect(() => {
    if (totalPages !== null && page < totalPages) {
      prefetchNextPageGames(queryClient, { ...queryKeyParams, page: page + 1 });
    }
  }, [page, totalPages, queryKeyParams, queryClient]);

  const handleClearGame = () => {
    setInputGame('');
    updateUrlParams({ game: null, filter: 'Default', page: '1' });
    if (nativeInputRef.current) nativeInputRef.current.value = '';
  };

  const changeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value;
    const updates: Record<string, string | null> = { page: '1', filter: newFilter === 'Default' ? null : newFilter };
    if (newFilter !== 'Game') updates.game = null;
    if (newFilter !== 'Date') {
      updates.from = null;
      updates.to = null;
    }
    updateUrlParams(updates);
  };

  return (
    <SimpleBar ref={scrollRef} className="min-h-0 h-full w-full">
      <div className="p-2 md:p-4 w-full">
        <AdSenseBanner />
        <div className="flex justify-center mt-2 flex-col items-center">
          {totalGames !== null && (
            <h4 className="text-primary text-3xl uppercase font-medium">{`${totalGames} Games`}</h4>
          )}
        </div>
        <div className="max-w-[1600px] mx-auto pt-1 flex flex-row items-center">
          {gameId && (
            <button
              onClick={() => window.history.back()}
              className="mr-2 bg-primary/20 border border-primary text-primary px-3 py-1.5 rounded hover:bg-primary/10 transition-colors flex items-center gap-1 text-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <select
            disabled={!!gameId}
            value={filter}
            onChange={changeFilter}
            className="bg-dark-light border border-gray-600 rounded px-3 py-1.5 text-sm mr-1 text-white w-max"
          >
            {FILTERS.map((data) => (
              <option key={data} value={data}>
                {data}
              </option>
            ))}
          </select>
          {filter === 'Date' && !gameId && (
            <div className="flex items-center gap-1 ml-1">
              <input
                type="date"
                min={FORMATTED_START}
                max={todayString}
                value={inputStartDate}
                onChange={(e) => {
                  setInputStartDate(e.target.value);
                  updateUrlParams({ from: e.target.value, page: '1' });
                }}
                className="bg-dark-light border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
              <input
                type="date"
                min={FORMATTED_START}
                max={todayString}
                value={inputEndDate}
                onChange={(e) => {
                  setInputEndDate(e.target.value);
                  updateUrlParams({ to: e.target.value, page: '1' });
                }}
                className="bg-dark-light border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
          )}
          {filter === 'Game' && !gameId && (
            <div className="ml-1 relative">
              <input
                ref={nativeInputRef}
                type="text"
                placeholder="Search by Game"
                onChange={(e) => {
                  setInputGame(e.target.value);
                  updateUrlParams({ game: e.target.value, filter: 'Game', page: '1' });
                }}
                value={inputGame}
                className="w-44 bg-dark-light border border-gray-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 pr-8"
              />
              {inputGame && (
                <button
                  onClick={handleClearGame}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>
        {isLoading && <Loading />}

        {!isLoading && games && games.length === 0 && (
          <p className="mt-12 text-center text-gray-400 text-sm">No games found matching your search filters.</p>
        )}

        {games && games.length > 0 && (
          <div
            className={`max-w-[1600px] mx-auto grid grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-2 transition-opacity duration-200 ${isBackgroundFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
          >
            {games.map((game: GameData, index: number) => (
              <div key={game.id}>
                <Game game={game} priority={index < 10} />
              </div>
            ))}
          </div>
        )}
        <div className={`flex justify-center ${totalPages <= 1 ? 'mt-2' : 'mt-4'} items-center flex-col md:flex-row`}>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            preserveParams={paginationParams}
            onHoverPage={(targetPage) => prefetchNextPageGames(queryClient, { ...queryKeyParams, page: targetPage })}
          />
        </div>
        <AdSenseBanner />
      </div>
      <Footer />
    </SimpleBar>
  );
}
