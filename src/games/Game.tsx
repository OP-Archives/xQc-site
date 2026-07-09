import { Link } from 'react-router-dom';
import CustomLink from '../utils/CustomLink';
import CustomWidthTooltip from '../utils/CustomToolTip';
import { toHHMMSS } from '../utils/helpers';
import GameImage from './GameImage';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

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
      <div className="overflow-hidden relative aspect-video w-full bg-dark-light group">
        <Link to={gameRoute}>
          <img className="thumbnail" alt="" src={game.thumbnail_url} />
        </Link>
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-glow"></div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0">
            <span className="text-xs p-1.5 bg-black/60 text-white">
              {DATE_FORMATTER.format(new Date(game.created_at))}
            </span>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0">
            <span className="text-xs p-1.5 bg-black/60 text-white">{toHHMMSS(game.duration)}</span>
          </div>
        </div>
      </div>
      <div className="mt-1 mb-1 flex items-start">
        <GameImage game={game} />
        <div className="min-w-0 flex-1 pl-2">
          <div className="p-0.5 min-w-0 w-full">
            <CustomWidthTooltip title={game.title || game.game_name || ''} placement="top">
              <span>
                <CustomLink href={gameRoute} className="block overflow-hidden">
                  <span className="text-primary font-medium block text-xs truncate">{game.title || game.game_name || ''}</span>
                </CustomLink>
              </span>
            </CustomWidthTooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
