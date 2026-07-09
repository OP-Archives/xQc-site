import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TwitchIcon, KickIcon } from '../assets/icons';
import { type VodData } from '../utils/archive-client';
import CustomWidthTooltip from '../utils/CustomToolTip';
import { toHHMMSS, getImage } from '../utils/helpers';
import Chapters from './ChaptersMenu';
import WatchMenu from './WatchMenu';

interface VodProps {
  vod: VodData;
  priority?: boolean;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const cardHoverVariants = {
  initial: { scale: 1 },
  whileHover: { scale: 1.02, transition: { duration: 0.2, ease: [0.25, 0.4, 0.25, 1] as const } },
  whileTap: { scale: 0.98 },
};

const getVodLink = (vod: VodData) => {
  if (vod.vod_uploads?.length > 0) return `/youtube/${vod.id}`;
  if (vod.games?.length > 0) return `/games/${vod.id}`;
  return null;
};

const getThumbnail = (vod: VodData) => {
  return vod.vod_uploads?.[0]?.thumbnail_url || vod.games?.[0]?.thumbnail_url || vod.thumbnail_url || null;
};

const getPlatform = (vod: VodData) => {
  if (vod.platform === 'twitch') return 'twitch';
  if (vod.platform === 'kick') return 'kick';
  return null;
};

const prefetchPlayerChunk = () => {
  import('@op-archives/vod-components').catch(() => {});
};

export default function Vod({ vod, priority }: VodProps) {
  const DEFAULT_VOD = getVodLink(vod);
  const DEFAULT_THUMBNAIL = getThumbnail(vod);
  const platform = getPlatform(vod);
  const chapterCount = vod.chapters?.length ?? 0;

  return (
    <div className="mb-2 block w-full min-w-0">
      <div className="overflow-visible rounded-md border border-transparent bg-[#16161e]/80 p-3 transition-all hover:border-[#222230] hover:bg-[#16161e]">
        <motion.div
          className="group relative flex aspect-video w-full overflow-hidden bg-primary shadow-[0_8px_20px_rgba(59,130,246,0)]"
          variants={cardHoverVariants}
          initial="initial"
          whileHover="whileHover"
          whileTap="whileTap"
        >
          <motion.div
            className="absolute inset-0 overflow-hidden rounded-md bg-[#222230]"
            whileHover={{ x: -6, y: -6 }}
          >
            {DEFAULT_VOD ? (
              <Link to={DEFAULT_VOD} className="absolute inset-0 block" onMouseEnter={prefetchPlayerChunk}>
                <img
                  className="thumbnail h-full w-full object-cover"
                  alt=""
                  src={DEFAULT_THUMBNAIL || undefined}
                  width={640}
                  height={360}
                  loading={priority ? 'eager' : 'lazy'}
                  fetchPriority={priority ? 'high' : 'auto'}
                  decoding="async"
                />
              </Link>
            ) : DEFAULT_THUMBNAIL ? (
              <img
                className="thumbnail h-full w-full object-cover"
                alt=""
                src={DEFAULT_THUMBNAIL || undefined}
                width={640}
                height={360}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9ca3af]">?</div>
            )}
            {vod.is_live && (
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-flex items-center gap-1.5 rounded bg-[#E40005]/90 px-2 py-0.5 text-[10px] font-bold text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  LIVE
                </span>
              </div>
            )}
            {platform && (
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center justify-center rounded bg-black/60 p-1 backdrop-blur-sm">
                  {platform === 'twitch' ? (
                    <TwitchIcon width={14} height={14} className="text-[#9146FF]" />
                  ) : platform === 'kick' ? (
                    <KickIcon width={14} height={14} className="text-[#53fc18]" />
                  ) : null}
                </span>
              </div>
            )}
            <div className="absolute bottom-0 left-0">
              <span className="bg-black/60 p-1.5 text-xs text-white">
                {DATE_FORMATTER.format(new Date(vod.created_at)).replace(',', '')}
              </span>
            </div>
            <div className="absolute right-0 bottom-0">
              <span className="bg-black/60 p-1.5 text-xs text-white">{toHHMMSS(vod.duration)}</span>
            </div>
          </motion.div>
        </motion.div>
        <div className="mt-2.5 mb-1 flex items-center gap-2.5 px-0.5">
          {chapterCount > 0 && (
            <div className="shrink-0 overflow-hidden rounded-sm ring-1 ring-[#222230]">
              <img
                src={getImage(vod.chapters?.[0]?.image, 40, 53)}
                className="block h-[53px] w-[40px] object-cover"
                alt={vod.chapters?.[0]?.name || 'Category'}
                loading="lazy"
              />
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="w-full min-w-0">
              {DEFAULT_VOD ? (
                <Link
                  to={DEFAULT_VOD}
                  className="inline-flex max-w-full min-w-0 no-underline"
                  onMouseEnter={prefetchPlayerChunk}
                >
                  <CustomWidthTooltip title={vod.title}>
                    <span className="truncate text-sm font-medium text-[#f0f0f5] transition-colors hover:text-primary">
                      {vod.title}
                    </span>
                  </CustomWidthTooltip>
                </Link>
              ) : (
                <CustomWidthTooltip title={vod.title}>
                  <span className="truncate text-sm font-medium text-[#f0f0f5]">{vod.title}</span>
                </CustomWidthTooltip>
              )}
            </div>

            <div className="mt-1.5 flex flex-nowrap items-center gap-1.5">
              {chapterCount > 0 && <Chapters vod={vod} />}

              <div className="ml-auto">
                <WatchMenu vod={vod} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
