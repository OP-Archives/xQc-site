import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import type SimpleBarCore from 'simplebar-core';
import SimpleBar from 'simplebar-react';
import { getGamesLibrary } from '../utils/archive-client';
import type { LibraryGameItem } from '../utils/archive-client';
import FilterBar from '../utils/FilterBar';
import { useDebouncedSetter } from '../utils/debounceHelper';
import { useListFilters } from '../utils/useListFilters';
import Footer from '../utils/Footer';
import Loading from '../utils/Loading';
import PaginationControls from '../utils/PaginationControls';
import { queryClient } from '../utils/queryClient';
import AdSenseBanner from '../utils/AdSenseBanner';
import { useGamesLibrary, prefetchNextPageGamesLibrary } from '../utils/useGamesLibrary';
import { useMediaQuery } from '../utils/useMediaQuery';
import GameCard from './GameCard';

export const gamesLibraryLoader = async ({ request }: import('react-router-dom').LoaderFunctionArgs) => {
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

const FILTERS = ['Recently Played', 'Most Played', 'Game Name'] as const;

export default function GamesLibrary() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const location = useLocation();

  const scrollRef = useRef<SimpleBarCore | null>(null);

  const urlSort = searchParams.get('sort') || 'recent';
  const apiSort = urlSort === 'recent' ? 'recent' : urlSort === 'game_name' ? 'game_name' : 'count';
  const displaySort = urlSort === 'recent' ? 'Recently Played' : urlSort === 'game_name' ? 'Game Name' : 'Most Played';

  const {
    state,
    updateParams,
  } = useListFilters({
    filterOptions: FILTERS,
    searchParamKey: { search: 'search', from: 'from', to: 'to' },
    defaultFilter: 'Recently Played',
  });

  const limit = isMobile ? 10 : 20;

  const [inputSearch, setInputSearch] = useState(state.inputSearch);

  useEffect(() => {
    setInputSearch(state.inputSearch);
  }, [state.inputSearch]);

  const debouncedSetSearch = useDebouncedSetter((val: string) => {
    updateParams({ search: val, page: '1' });
  }, 500);

  const queryKeyParams = useMemo(
    () => ({
      page: state.page,
      limit,
      ...(state.inputSearch.length > 0 ? { game_name: state.inputSearch } : {}),
      sort: apiSort,
      order: urlSort === 'game_name' ? 'asc' : 'desc',
    }),
    [state.page, limit, state.inputSearch, apiSort, urlSort]
  );

  const { data, isLoading, isFetching } = useGamesLibrary(queryKeyParams);
  const games = data?.data ?? null;
  const totalGames = data?.meta?.total ?? null;
  const totalPages = Math.ceil((totalGames || 0) / limit);
  const isBackgroundFetching = isFetching && !isLoading;

  const paginationParams = {
    ...(state.inputSearch ? { search: state.inputSearch } : {}),
    sort: urlSort,
  };

  useEffect(() => {
    if (totalPages !== null && state.page < totalPages) {
      prefetchNextPageGamesLibrary(queryClient, { ...queryKeyParams, page: state.page + 1 });
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

  const changeFilterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const apiValue = newSort === 'Recently Played' ? 'recent' : newSort === 'Game Name' ? 'game_name' : 'count';
    updateParams({ sort: apiValue, page: '1' });
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
          <FilterBar
            mode="library"
            filterValue={displaySort}
            onFilterChange={() => {}}
            searchValue={inputSearch}
            onSearchChange={setInputSearch}
            debouncedOnSearchChange={debouncedSetSearch}
            onSearchClear={() => {
              setInputSearch('');
              updateParams({ search: null, page: '1' });
            }}
            showSearch
            searchPlaceholder="Search by Game"
            showFilter={false}
            filterOptions={FILTERS}
            extraControls={
              <select
                value={displaySort}
                onChange={changeFilterSelect}
                className="border-border bg-bg-surface text-text-primary hover:border-border/80 focus:border-primary focus:ring-primary/30 h-9 w-max rounded-md border px-3 text-sm transition-all duration-200 focus:ring-1 focus:outline-none sm:ml-1"
              >
                {FILTERS.map((data) => (
                  <option key={data} value={data}>
                    {data}
                  </option>
                ))}
              </select>
            }
          />
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
          page={state.page}
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
