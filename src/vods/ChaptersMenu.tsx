import humanize from 'humanize-duration';
import { List } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type VodData, type ChapterItem } from '../utils/archive-client';
import { toHMS, getImage } from '../utils/helpers';

interface ChaptersProps {
  vod: VodData;
}

const EMPTY_CHAPTERS: ChapterItem[] = [];

export default function Chapters({ vod }: ChaptersProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    maxWidth?: number;
  }>({});

  const [expanded, setExpanded] = useState(false);
  const chaptersArray = vod.chapters || EMPTY_CHAPTERS;
  const visibleChapters = expanded ? chaptersArray : chaptersArray.slice(0, 15);

  const menuRef = useRef<HTMLDivElement>(null);

  const DEFAULT_VOD = vod?.vod_uploads?.length > 0 ? `/youtube/${vod.id}` : `/manual/${vod.id}`;
  const isOpen = anchorEl !== null;

  useEffect(() => {
    if (!anchorEl) {
      setExpanded(false);
      return;
    }

    const handleOutsideInteraction = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        setAnchorEl(null);
        return;
      }

      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }

      if (e.type !== 'keydown') {
        setAnchorEl(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('wheel', handleOutsideInteraction, { capture: true, passive: true });
    document.addEventListener('touchmove', handleOutsideInteraction, { capture: true, passive: true });
    document.addEventListener('keydown', handleOutsideInteraction);

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('wheel', handleOutsideInteraction, { capture: true });
      document.removeEventListener('touchmove', handleOutsideInteraction, { capture: true });
      document.removeEventListener('keydown', handleOutsideInteraction);
    };
  }, [anchorEl]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuMaxHeight = 400;
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow < menuMaxHeight && rect.top > spaceBelow) {
        setCoords({
          bottom: window.innerHeight - rect.top + 8,
          left: rect.left,
          maxWidth: window.innerWidth - rect.left - 16,
        });
      } else {
        setCoords({
          top: rect.bottom + 8,
          left: rect.left,
          maxWidth: window.innerWidth - rect.left - 16,
        });
      }
      setAnchorEl(e.currentTarget);
    }
  };

  return (
    <div className="relative">
      <button
        onMouseDown={(e) => {
          e.stopPropagation();
          handleClick(e);
        }}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
          isOpen
            ? 'cursor-default bg-[#1e1e2a] text-[#4b5563]'
            : 'cursor-pointer bg-[#222230] text-[#f0f0f5] transition-colors hover:bg-[#2c2c3d]'
        }`}
      >
        <List size={14} className="text-[#9ca3af]" />
        <span>Chapters</span>
        <span className="ml-0.5 flex items-center justify-center rounded bg-primary px-1.5 py-0.5 text-[10px] leading-none font-bold text-[#0e0e10]">
          {chaptersArray.length}
        </span>
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 max-h-[400px] overflow-y-auto overscroll-contain rounded border border-gray-700 bg-dark-light shadow-xl"
          style={{
            ...(coords.top !== undefined ? { top: coords.top } : {}),
            ...(coords.bottom !== undefined ? { bottom: coords.bottom } : {}),
            ...(coords.left !== undefined ? { left: coords.left } : {}),
            ...(coords.right !== undefined ? { right: coords.right } : {}),
            width: 'max-content',
            maxWidth: '200px',
          }}
        >
          <div>
            {visibleChapters.map((data) => (
              <div
                key={`${vod.id}${data?.game_id}${data?.start}`}
              >
                <Link
                  to={`${DEFAULT_VOD}?t=${toHMS(data?.start as number)}`}
                  onClick={handleClose}
                  className="flex w-full cursor-pointer items-start border-b border-gray-800 px-3 py-2 text-left last:border-0 hover:bg-dark-hover"
                >
                  <div className="mr-2 shrink-0">
                    <img
                      alt=""
                      src={getImage(data.image)}
                      width={40}
                      height={53}
                      className="h-[53px] w-[40px] object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm leading-snug break-words whitespace-normal text-primary">
                      {data.name}
                    </span>
                    {data.end !== undefined && data.duration !== undefined && (
                      <span className="mt-0.5 text-xs text-gray-400">
                        {humanize(data.duration * 1000, { largest: 2 })}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}

            {!expanded && chaptersArray.length > 15 && (
              <button
                onClick={() => setExpanded(true)}
                className="block w-full cursor-pointer bg-dark py-2 text-center text-xs font-semibold text-primary hover:bg-dark-hover"
              >
                {`Show ${chaptersArray.length - 15} More Chapters...`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
