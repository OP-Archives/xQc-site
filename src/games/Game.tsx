import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toHHMMSS, getImage } from '../utils/helpers';

const GAME_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const cardHoverVariants = {
  initial: { scale: 1 },
  whileHover: { scale: 1.02, transition: { duration: 0.2, ease: [0.25, 0.4, 0.25, 1] as const } },
  whileTap: { scale: 0.98 },
};

interface GameProps {
  game: {
    id: string;
    vod_id: string;
    title: string;
    created_at: string;
    duration: number;
    thumbnail_url?: string;
    chapter_image?: string;
    game_name?: string;
  };
  isMobile?: boolean;
  priority?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Game({ game, isMobile: _isMobile, priority: _priority }: GameProps) {
  const gameRoute = `/games/${game.vod_id}?game_id=${game.id}`;

  return (
    <div className="max-w-[20rem] flex-basis-[20rem]">
      <div className="block w-full min-w-0 cursor-pointer">
        <div className="overflow-visible rounded-md border border-transparent bg-[#16161e]/80 p-3 transition-all hover:border-[#222230] hover:bg-[#16161e]">
          <motion.div
            className="group relative aspect-video w-full bg-primary shadow-[0_8px_20px_rgba(254,254,254,0)]"
            variants={cardHoverVariants}
            initial="initial"
            whileHover="whileHover"
            whileTap="whileTap"
          >
            <motion.div
              className="absolute inset-0 overflow-hidden rounded-md bg-[#222230]"
              whileHover={{ x: -6, y: -6 }}
            >
              <Link to={gameRoute}>
                {game.thumbnail_url ? (
                  <img className="thumbnail h-full w-full object-cover" alt="" src={game.thumbnail_url} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9ca3af]">?</div>
                )}
              </Link>
              <motion.div
                className="shadow-glow pointer-events-none absolute inset-0"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute bottom-0 left-0">
                  <span className="bg-black/60 p-1.5 text-xs text-white">
                    {GAME_DATE_FORMATTER.format(new Date(game.created_at))}
                  </span>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-0 bottom-0">
                  <span className="bg-black/60 p-1.5 text-xs text-white">{toHHMMSS(game.duration)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
          <div className="mt-1 mb-1 flex cursor-default items-start">
            <div className="mr-2 shrink-0">
              <img
                alt=""
                src={getImage(game.chapter_image, 40, 53)}
                width={40}
                height={53}
                className="h-[53px] w-[40px] shrink-0 object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                to={gameRoute}
                className="inline-flex max-w-full min-w-0 no-underline"
              >
                <span className="truncate text-xs font-medium text-primary">
                  {game.title || game.game_name || ''}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
