import { DayPicker, type DropdownProps } from '@daypicker/react';
import { useEffect, useRef, useState } from 'react';

function DarkSelect({ value, options, onChange }: DropdownProps) {
  const opts = options ?? [];
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange?.(e as unknown as React.ChangeEvent<HTMLSelectElement>)}
      className="rounded border border-[#222230] bg-[#16161e] px-2 py-1 text-sm text-text-primary transition-colors focus:border-primary focus:ring-primary-hover/30 focus:outline-none"
    >
      {opts.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  maxDate?: string;
  minDate?: string;
}

function parseDateString(input: string): Date | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  return d;
}

export function DatePicker({ value, onChange, maxDate, minDate }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const safeMinDate = minDate?.split('T')[0];
  const safeMaxDate = maxDate?.split('T')[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const [month, setMonth] = useState<Date>(() => {
    if (value) {
      const d = new Date(value.split('T')[0] + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    if (safeMinDate) {
      const d = new Date(safeMinDate + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  useEffect(() => {
    if (value) {
      const d = new Date(value.split('T')[0] + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setMonth(d);
      }
    }
  }, [value]);

  const selected = value ? new Date(value.split('T')[0] + 'T00:00:00') : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const year = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${m}-${d}`);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw);
    const parsed = parseDateString(raw);
    if (parsed) {
      setMonth(parsed);
    }
  };

  const displayMonth = new Date(month.getFullYear(), month.getMonth(), 1);

  const startMonth = safeMinDate ? new Date(safeMinDate + 'T00:00:00') : undefined;
  const endMonth = safeMaxDate ? new Date(safeMaxDate + 'T23:59:59') : undefined;

  const disabledRange = (() => {
    const after = safeMaxDate ? new Date(safeMaxDate + 'T23:59:59') : undefined;
    const before = safeMinDate ? new Date(safeMinDate + 'T00:00:00') : undefined;
    if (before && after) return { before, after };
    if (before) return { before };
    if (after) return { after };
    return undefined;
  })();

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onClick={() => setOpen(true)}
        placeholder="YYYY-MM-DD"
        className="border-border bg-bg-surface text-text-primary placeholder-text-secondary hover:border-border/80 focus:border-primary focus:ring-primary/30 h-9 w-full rounded-md border px-3 text-sm transition-all duration-200 focus:ring-1 focus:outline-none sm:w-36"
      />
      {open && (
        <div className="border-border bg-bg-surface absolute z-50 mt-1 rounded-md border p-2 shadow-lg">
          <DayPicker
            mode="single"
            selected={selected}
            month={displayMonth}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            captionLayout="dropdown"
            startMonth={startMonth}
            endMonth={endMonth}
            components={{ Dropdown: DarkSelect }}
            disabled={disabledRange}
            classNames={{
              nav: 'hidden',
            }}
            styles={{
              day_button: {
                width: '36px',
                height: '36px',
                fontSize: '14px',
                borderRadius: '6px',
                borderWidth: '0px',
              },
              caption_label: {
                fontSize: '14px',
                fontWeight: 500,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
