import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CustomWidthTooltip from '../utils/CustomToolTip';
import { getImage } from '../utils/helpers';

interface GameCardProps {
  game_id: string;
  name: string;
  image?: string;
  count: number;
}

const cardHoverVariants = {
  initial: { scale: 1 },
  whileHover: { scale: 1.02, transition: { duration: 0.2, ease: [0.25, 0.4, 0.25, 1] as const } },
  whileTap: { scale: 0.98 },
};

export default function GameCard({ game_id, name, image, count }: GameCardProps) {
  return (
    <Link to={`/games?game_id=${game_id}`} className="block w-full min-w-0 cursor-pointer rounded no-underline">
      <motion.div variants={cardHoverVariants} initial="initial" whileHover="whileHover" whileTap="whileTap">
        <div
          className="relative w-full rounded-t bg-primary shadow-[0_8px_20px_rgba(59,130,246,0)]"
          style={{ aspectRatio: '400/530' }}
        >
          <motion.div className="absolute inset-0 overflow-hidden rounded-t bg-[#222230]" whileHover={{ x: -6, y: -6 }}>
            <img
              src={getImage(image, 400, 530)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </motion.div>
      <div className="w-full min-w-0 px-1 py-0.5 text-center flex flex-col gap-0.5">
        <div className="flex justify-center">
          <CustomWidthTooltip title={name}>
            <span className="block truncate text-xs font-medium text-[#f0f0f5]">{name}</span>
          </CustomWidthTooltip>
        </div>
        <span className="text-xs text-[#9ca3af]">{count || 0} EPs</span>
      </div>
    </Link>
  );
}
