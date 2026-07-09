import { Film, Play, FilePlay } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { type VodData } from '../utils/archive-client';
import CustomLink from '../utils/CustomLink';

interface WatchMenuProps {
  vod: VodData;
}

export default function WatchMenu({ vod }: WatchMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchorEl) return;

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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
      });
      setAnchorEl(event.currentTarget);
    }
  };

  return (
    <>
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleClick}
        className="border border-primary text-primary font-semibold flex items-center gap-1 px-3 py-1 rounded hover:bg-primary/10 transition-colors cursor-pointer"
      >
        <Play size={16} /> Watch
      </button>
      {anchorEl && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-dark-light border border-gray-700 rounded shadow-xl w-max"
          style={{ left: coords.left, top: coords.top }}
        >
          <div className="p-1">
            <CustomLink
              href={`/youtube/${vod.id}`}
              onClick={() => setAnchorEl(null)}
              className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded hover:bg-dark-hover transition-colors text-white ${vod.vod_uploads.length === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
            >
              <YouTubeIcon size={20} /> Youtube
            </CustomLink>
            {Date.now() - new Date(vod.created_at).getTime() <= 14 * 24 * 60 * 60 * 1000 && (
              <CustomLink
                href={`/cdn/${vod.id}`}
                onClick={() => setAnchorEl(null)}
                className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded hover:bg-dark-hover transition-colors text-white ${vod.vod_uploads.length === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
              >
                <FilePlay size={20} /> CDN
              </CustomLink>
            )}
            <CustomLink
              href={`/manual/${vod.id}`}
              onClick={() => setAnchorEl(null)}
              className="flex items-center gap-2 px-3 py-2 w-full text-left rounded hover:bg-dark-hover transition-colors text-white"
            >
              <Film size={20} /> Manual
            </CustomLink>
            {vod.games.length !== 0 && (
              <CustomLink
                href={`/games/${vod.id}`}
                onClick={() => setAnchorEl(null)}
                className="flex items-center gap-2 px-3 py-2 w-full text-left rounded hover:bg-dark-hover transition-colors text-white"
              >
                <YouTubeIcon className="w-5 h-5" /> Games
              </CustomLink>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const YouTubeIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
