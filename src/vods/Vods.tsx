import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import type SimpleBarCore from 'simplebar-core';
import SimpleBar from 'simplebar-react';
import FilterBar from '../utils/FilterBar';
import { useDebouncedSetter } from '../utils/debounceHelper';
import { useListFilters } from '../utils/useListFilters';
import Footer from '../utils/Footer';
import Loading from '../utils/Loading';
import PaginationControls from '../utils/PaginationControls';
import AdSenseBanner from '../utils/AdSenseBanner';
import { useVods, prefetchNextPageVods } from '../utils/useVods';
import Vod from './Vod';

const FILTERS = ['Default', 'Date', 'Title', 'Game'] as const;
const PLATFORMS = ['All', 'Twitch', 'Kick'];
const START_DATE = import.meta.env.VITE_START_DATE;

const FORMATTED_START = START_DATE ? new Date(START_DATE).toISOString().split('T')[0] : '';

export default function Vods() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    searchParamKey: { search: 'title', from: 'from', to: 'to' },
    defaultFilter: 'Default',
    todayString,
  });

  const [platformState, setPlatformState] = useState(() => {
    return searchParams.get('platform') || PLATFORMS[0];
  });
  const [inputGame, setInputGame] = useState(() => {
    const chapter = searchParams.get('chapter') || '';
    return chapter;
  });
  const [inputTitle, setInputTitle] = useState(state.inputSearch);

  useEffect(() => {
    setInputTitle(state.inputSearch);
  }, [state.inputSearch]);

  useEffect(() => {
    const chapter = searchParams.get('chapter') || '';
    setInputGame(chapter);
  }, [searchParams.get('chapter')]);

  useEffect(() => {
    const platform = searchParams.get('platform') || PLATFORMS[0];
    setPlatformState(platform);
  }, [searchParams]);

  const debouncedSetTitle = useDebouncedSetter((val: string) => {
    updateParams({ title: val, filter: 'Title', page: '1' });
  }, 500);

  const debouncedSetGame = useDebouncedSetter((val: string) => {
    updateParams({ chapter: val, filter: 'Game', page: '1' });
  }, 500);

  const filterTitle = inputTitle;
  const filterGame = inputGame;

  const queryKeyParams = useMemo(
    () => ({
      ...baseParams,
      sort: 'created_at',
      order: 'desc',
      ...(platformState !== PLATFORMS[0] ? { platform: platformState.toLowerCase() } : {}),
      ...(state.filter === 'Title' && filterTitle ? { title: filterTitle } : {}),
      ...(state.filter === 'Game' && filterGame ? { chapter: filterGame } : {}),
    }),
    [baseParams, platformState, state.filter, filterTitle, filterGame]
  );

  const handleClearTitle = () => {
    setInputTitle('');
    updateParams({ title: null, filter: 'Title', page: '1' });
  };

  const handleClearGame = () => {
    setInputGame('');
    updateParams({ chapter: null, filter: 'Game', page: '1' });
  };

  const changePlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlatformState(e.target.value);
    updateParams({
      platform: e.target.value === PLATFORMS[0] ? null : e.target.value,
      page: '1',
    });
  };

  const { data, isLoading, isFetching } = useVods(queryKeyParams);
  const vods = data?.data ?? null;
  const totalVods = data?.meta?.total ?? null;
  const totalPages = Math.ceil((totalVods || 0) / 20);
  const isBackgroundFetching = isFetching && !isLoading;

  const paginationParams = {
    ...(state.gameId ? { game_id: state.gameId } : {}),
    ...(platformState !== PLATFORMS[0] ? { platform: platformState.toLowerCase() } : {}),
    ...(state.filter !== 'Default' ? { filter: state.filter } : {}),
    ...(state.filter === 'Date' ? { from: state.filterStartDate, to: state.filterEndDate } : {}),
    ...(filterTitle ? { title: filterTitle } : {}),
    ...(filterGame ? { chapter: filterGame } : {}),
  };

  useEffect(() => {
    if (totalPages !== null && state.page < totalPages) {
      prefetchNextPageVods(queryClient, { ...queryKeyParams, page: state.page + 1 });
    }
  }, [state.page, totalPages, queryKeyParams, queryClient]);

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
          {totalVods !== null && <h4 className="text-primary text-3xl uppercase font-medium">{`${totalVods} Vods`}</h4>}
        </div>
        <div className="max-w-[1600px] mx-auto">
          <FilterBar
          mode="vods"
          filterValue={state.filter}
          onFilterChange={(val) => {
            const e = { target: { value: val } } as React.ChangeEvent<HTMLSelectElement>;
            changeFilter(e);
          }}
          searchValue={state.filter === 'Title' ? inputTitle : inputGame}
          onSearchChange={(val) => {
            if (state.filter === 'Title') {
              setInputTitle(val);
            } else {
              setInputGame(val);
            }
          }}
          debouncedOnSearchChange={(val) => {
            if (state.filter === 'Title') {
              debouncedSetTitle(val);
            } else {
              debouncedSetGame(val);
            }
          }}
          onSearchClear={() => {
            if (state.filter === 'Title') handleClearTitle();
            else handleClearGame();
          }}
          dateStartValue={state.inputStartDate}
          dateEndValue={state.inputEndDate}
          onDateStartChange={(val) => updateParams({ from: val, page: '1' })}
          onDateEndChange={(val) => updateParams({ to: val, page: '1' })}
          maxDate={todayString}
          minDate={FORMATTED_START}
          showDateRange={state.filter === 'Date'}
          showSearch={state.filter === 'Title' || state.filter === 'Game'}
          searchPlaceholder={state.filter === 'Game' ? 'Search by Game' : 'Search by Title'}
          disabled={!!state.gameId}
          gameId={state.gameId}
          onBack={() => navigate(-1)}
          hasBackButton={!!state.gameId}
          extraControls={
            <select
              disabled={!!state.gameId}
              value={platformState}
              onChange={changePlatform}
              className="border-border bg-bg-surface text-text-primary hover:border-border/80 focus:border-primary focus:ring-primary/30 h-9 w-max rounded-md border px-3 text-sm transition-all duration-200 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:ml-1"
            >
              {PLATFORMS.map((data) => (
                <option key={data} value={data}>
                  {data}
                </option>
              ))}
            </select>
          }
          filterOptions={FILTERS}
          />
        </div>
        {isLoading && <Loading />}

        {!isLoading && vods && vods.length === 0 && (
          <p className="mt-12 text-center text-gray-400 text-sm">No VODs found matching your search filters.</p>
        )}

        {vods && vods.length > 0 && (
          <div
            className={`max-w-[1600px] mx-auto grid grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-2 transition-opacity duration-200 ${isBackgroundFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
          >
            {vods.map((vod, index) => (
              <div key={vod.id}>
                <Vod vod={vod} priority={index < 10} />
              </div>
            ))}
          </div>
        )}
        <div className={`flex justify-center ${totalPages <= 1 ? 'mt-2' : 'mt-4'} items-center flex-col md:flex-row`}>
          <PaginationControls
            page={state.page}
            totalPages={totalPages}
            preserveParams={paginationParams}
            onHoverPage={(targetPage) => prefetchNextPageVods(queryClient, { ...queryKeyParams, page: targetPage })}
          />
        </div>
        <AdSenseBanner />
      </div>
      <Footer />
    </SimpleBar>
  );
}
