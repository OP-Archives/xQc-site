import { ArrowLeft, X } from 'lucide-react';
import { type ReactNode } from 'react';
import { DatePicker } from './DatePicker';

interface FilterBarProps {
  mode: 'vods' | 'games' | 'library';
  filterValue: string;
  onFilterChange: (value: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  debouncedOnSearchChange?: (value: string) => void;
  onSearchClear: () => void;
  dateStartValue?: string;
  dateEndValue?: string;
  onDateStartChange?: (value: string) => void;
  onDateEndChange?: (value: string) => void;
  maxDate?: string;
  minDate?: string;
  showDateRange?: boolean;
  showSearch?: boolean;
  disabled?: boolean;
  gameId?: string | null;
  onBack?: () => void;
  hasBackButton?: boolean;
  extraControls?: ReactNode;
  filterOptions?: readonly string[];
  showFilter?: boolean;
  searchPlaceholder?: string;
}

export default function FilterBar({
  mode,
  filterValue,
  onFilterChange,
  searchValue,
  onSearchChange,
  onSearchClear,
  dateStartValue,
  dateEndValue,
  onDateStartChange,
  onDateEndChange,
  showDateRange,
  showSearch,
  disabled,
  gameId,
  onBack,
  hasBackButton,
  extraControls,
  filterOptions = ['Default', 'Date', 'Game'],
  showFilter = mode !== 'library',
  searchPlaceholder,
  debouncedOnSearchChange,
  maxDate,
  minDate,
}: FilterBarProps) {
  return (
    <div className="flex flex-col flex-wrap items-stretch gap-2 pt-1 sm:flex-row sm:items-center sm:gap-1">
      <div className="flex flex-row items-center gap-2 sm:gap-1">
        {hasBackButton && (
          <button
            onClick={onBack}
            className="flex h-9 w-fit items-center gap-1 rounded-md border border-transparent bg-[#6366f1] px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#4f46e5]"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        {showFilter && (
          <select
            disabled={disabled || !!gameId}
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className="border-border bg-bg-surface text-text-primary hover:border-border/80 focus:border-primary focus:ring-primary/30 h-9 w-max rounded-md border px-3 text-sm transition-all duration-200 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {filterOptions.map((data) => (
              <option key={data} value={data}>
                {data}
              </option>
            ))}
          </select>
        )}
        {extraControls && <div className="sm:hidden ml-auto">{extraControls}</div>}
      </div>
      {showDateRange &&
        onDateStartChange &&
        onDateEndChange &&
        dateStartValue !== undefined &&
        dateEndValue !== undefined &&
        !gameId && (
          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-1">
            <DatePicker value={dateStartValue} onChange={onDateStartChange} maxDate={maxDate} minDate={minDate} />
            <DatePicker value={dateEndValue} onChange={onDateEndChange} maxDate={maxDate} minDate={minDate} />
          </div>
        )}
      {showSearch && (
        <div className="relative w-full sm:flex-1 sm:min-w-0 sm:w-auto">
          <input
            type="text"
            placeholder={searchPlaceholder ?? (mode === 'vods' ? 'Search by Title' : 'Search by Game')}
            onChange={(e) => {
              onSearchChange(e.target.value);
              debouncedOnSearchChange?.(e.target.value);
            }}
            value={searchValue}
            className="border-border bg-bg-surface text-text-primary placeholder-text-secondary hover:border-border/80 focus:border-primary focus:ring-primary/30 h-9 w-full rounded-md border px-3 pr-8 text-sm transition-all duration-200 focus:ring-1 focus:outline-none sm:w-44"
          />
          {searchValue && (
            <button
              onClick={onSearchClear}
              className="text-text-secondary hover:text-text-primary absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
      <div className="hidden sm:block">{extraControls}</div>
    </div>
  );
}
