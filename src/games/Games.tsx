import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type SimpleBarCore from 'simplebar-core';
import SimpleBar from 'simplebar-react';
import { type GameData } from '../utils/archive-client';
import FilterBar from '../utils/FilterBar';
import { useDebouncedSetter } from '../utils/debounceHelper';
import { useListFilters } from '../utils/useListFilters';
import Footer from '../utils/Footer';
import Loading from '../utils/Loading';
import PaginationControls from '../utils/PaginationControls';
import { useGames, prefetchNextPageGames } from '../utils/useGames';
import { queryClient } from '../utils/queryClient';
import AdSenseBanner from '../utils/AdSenseBanner';
import Game from './Game';

const FILTERS = ['Default', 'Date', 'Game'] as const;
const START_DATE = import.meta.env.VITE_START_DATE;

const FORMATTED_START = START_DATE ? new Date(START_DATE).toISOString().split('T')[0] : '';

export default function GamesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const todayString = new Date().toISOString().split('T')[0];

  const scrollRef = useRef<SimpleBarCore | null>(null);

  const {
    state,
    updateParams,
    changeFilter,
    queryKeyParams: baseParams,
  } = useListFilters({
    filterOptions: FILTERS,
    searchParamKey: { search: 'game', from: 'from', to: 'to' },
    defaultFilter: 'Default',
    todayString,
  });

  const [inputGame, setInputGame] = useState(state.inputSearch);

  useEffect(() => {
    setInputGame(state.inputSearch);
  }, [state.inputSearch]);

  const debouncedSetGame = useDebouncedSetter((val: string) => {
    updateParams({ game: val, filter: 'Game', page: '1' });
  }, 500);

  const filterGame = inputGame;

  const queryKeyParams = useMemo(
    () => ({
      ...baseParams,
      sort: 'created_at',
      order: 'desc',
      ...(state.filter === 'Game' && filterGame ? { game_name: filterGame } : {}),
    }),
    [baseParams, state.filter, filterGame]
  );

  const { data, isLoading, isFetching } = useGames(queryKeyParams);
  const games = data?.data ?? null;
  const totalGames = data?.meta?.total ?? null;
  const totalPages = Math.ceil((totalGames || 0) / 20);
  const isBackgroundFetching = isFetching && !isLoading;

  const paginationParams = {
    ...(state.gameId ? { game_id: state.gameId } : {}),
    ...(state.filter !== 'Default' ? { filter: state.filter } : {}),
    ...(state.filter === 'Date' ? { from: state.filterStartDate, to: state.filterEndDate } : {}),
    ...(filterGame ? { game: filterGame } : {}),
  };

  useEffect(() => {
    if (totalPages !== null && state.page < totalPages) {
      prefetchNextPageGames(queryClient, { ...queryKeyParams, page: state.page + 1 });
    }
  }, [state.page, totalPages, queryKeyParams, queryClient]);

  const handleClearGame = () => {
    setInputGame('');
    updateParams({ game: null, filter: 'Game', page: '1' });
  };

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
  }, [state.page, location.key]);

  return (
    <SimpleBar ref={scrollRef} className="min-h-0 h-full w-full">
      <div className="p-2 md:p-4 w-full">
        <AdSenseBanner />
        <div className="flex justify-center mt-2 flex-col items-center">
          {totalGames !== null && (
            <h4 className="text-primary text-3xl uppercase font-medium">{`${totalGames} Games`}</h4>
          )}
        </div>
        <div className="max-w-[1600px] mx-auto">
          <FilterBar
          mode="games"
          filterValue={state.filter}
          onFilterChange={(val) => {
            const e = { target: { value: val } } as React.ChangeEvent<HTMLSelectElement>;
            changeFilter(e);
          }}
          searchValue={inputGame}
          onSearchChange={setInputGame}
          debouncedOnSearchChange={debouncedSetGame}
          onSearchClear={handleClearGame}
          dateStartValue={state.inputStartDate}
          dateEndValue={state.inputEndDate}
          onDateStartChange={(val) => updateParams({ from: val, page: '1' })}
          onDateEndChange={(val) => updateParams({ to: val, page: '1' })}
          maxDate={todayString}
          minDate={FORMATTED_START}
          showDateRange={state.filter === 'Date'}
          showSearch={state.filter === 'Game'}
          disabled={!!state.gameId}
          gameId={state.gameId}
          onBack={() => navigate(-1)}
          hasBackButton={!!state.gameId}
          filterOptions={FILTERS}
          />
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
            page={state.page}
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
