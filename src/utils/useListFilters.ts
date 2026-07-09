import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseListFiltersOptions<TFilter extends string> {
  filterOptions: readonly TFilter[];
  searchParamKey: {
    search: string;
    from: string;
    to: string;
  };
  defaultFilter?: TFilter;
  preserveParams?: Record<string, string | null>;
  todayString?: string;
}

export interface ListFiltersState<TFilter extends string> {
  filter: TFilter;
  filterStartDate: string;
  filterEndDate: string;
  page: number;
  gameId: string | null;
  limit: number;
  inputSearch: string;
  inputStartDate: string;
  inputEndDate: string;
}

export function useListFilters<TFilter extends string>({
  filterOptions,
  searchParamKey,
  defaultFilter,
  preserveParams = {},
  todayString,
}: UseListFiltersOptions<TFilter>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = todayString || new Date().toISOString().split('T')[0];
  const filter = (searchParams.get('filter') || defaultFilter || filterOptions[0]) as TFilter;
  const filterStartDate = searchParams.get(searchParamKey.from) || '';
  const filterEndDate = searchParams.get(searchParamKey.to) || today;
  const searchInput = searchParams.get(searchParamKey.search) || '';
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

  const [inputSearch, setInputSearch] = useState(searchInput);
  const [inputStartDate, setInputStartDate] = useState(filterStartDate);
  const [inputEndDate, setInputEndDate] = useState(filterEndDate);

  useEffect(() => {
    setInputSearch(searchInput);
  }, [searchInput]);
  useEffect(() => {
    setInputStartDate(filterStartDate);
  }, [filterStartDate]);
  useEffect(() => {
    setInputEndDate(filterEndDate);
  }, [filterEndDate]);

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, val] of Object.entries(updates)) {
          if (val) next.set(key, val);
          else next.delete(key);
        }
        for (const [key, val] of Object.entries(preserveParams)) {
          if (val) next.set(key, val);
        }
        if (gameId) next.set('game_id', gameId);
        return next;
      },
      { replace: true }
    );
  };

  const state: ListFiltersState<TFilter> = {
    filter,
    filterStartDate,
    filterEndDate,
    page,
    gameId,
    limit,
    inputSearch,
    inputStartDate,
    inputEndDate,
  };

  const changeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value as TFilter;
    const updates: Record<string, string | null> = {
      page: '1',
      filter: newFilter === defaultFilter || newFilter === 'Default' ? null : newFilter,
    };
    updates[searchParamKey.search] = null;
    if (newFilter !== 'Date') {
      updates[searchParamKey.from] = null;
      updates[searchParamKey.to] = null;
    }
    updateParams(updates);
  };

  const handleClearSearch = () => {
    setInputSearch('');
    updateParams({ [searchParamKey.search]: null, page: '1' });
  };

  const queryKeyParams = useMemo(
    () => ({
      limit,
      page,
      ...(gameId ? { game_id: gameId } : {}),
      ...(memoizedDateRange ? memoizedDateRange : {}),
    }),
    [limit, page, gameId, memoizedDateRange]
  );

  return {
    state,
    updateParams,
    changeFilter,
    handleClearSearch,
    queryKeyParams,
    memoizedDateRange,
  };
}
