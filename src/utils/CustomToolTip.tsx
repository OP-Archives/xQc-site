import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface CustomWidthTooltipProps {
  title: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
}

export default function CustomWidthTooltip({ title, placement = 'top', children }: CustomWidthTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, align: 'center' });

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const clientX = e.clientX;
    const clientY = e.clientY;

    let newAlign = 'center';
    let newLeft = clientX;

    if (placement === 'top' || placement === 'bottom') {
      const safeThreshold = 224;

      if (clientX < safeThreshold) {
        newAlign = 'left';
        newLeft = clientX + 8;
      } else if (window.innerWidth - clientX < safeThreshold) {
        newAlign = 'right';
        newLeft = clientX - 8;
      }
    }

    setCoords({ top: clientY, left: newLeft, align: newAlign });
    setIsHovered(true);
  };

  if (!title) return <>{children}</>;

  const getTransform = () => {
    if (placement === 'top') {
      if (coords.align === 'left') return 'translate(0, calc(-100% - 16px))';
      if (coords.align === 'right') return 'translate(-100%, calc(-100% - 16px))';
      return 'translate(-50%, calc(-100% - 16px))';
    }
    if (placement === 'bottom') {
      if (coords.align === 'left') return 'translate(0, 16px)';
      if (coords.align === 'right') return 'translate(-100%, 16px)';
      return 'translate(-50%, 16px)';
    }
    if (placement === 'left') return 'translate(calc(-100% - 16px), -50%)';
    if (placement === 'right') return 'translate(16px, -50%)';
    return 'translate(-50%, calc(-100% - 16px))';
  };

  return (
    <div className="group relative inline-flex max-w-full min-w-0 items-center" ref={containerRef}>
      <span className="contents" onMouseEnter={handleMouseEnter} onMouseLeave={() => setIsHovered(false)}>
        {children}
      </span>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isHovered && (
              <motion.div
                key="tooltip-portal"
                className="pointer-events-none fixed z-[1300] w-max max-w-[calc(100vw-2rem)]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.25, 0.4, 0.25, 1] as const }}
                style={{
                  top: coords.top,
                  left: coords.left,
                  transform: getTransform(),
                }}
              >
                <div
                  className="rounded border border-[#222230] bg-[#16161e] px-3 py-1.5 text-sm break-words whitespace-normal text-white shadow-lg"
                  style={{ maxWidth: 'min(400px, calc(100vw - 2rem))' }}
                >
                  {title}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
