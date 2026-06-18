"use client";

import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface PitProps {
  index: number;
  seeds: number;
  isValid: boolean;
  isLastMove: boolean;
  isLastSown: boolean;
  isLastCaptured: boolean;
  player: 0 | 1; // which player owns this pit
  disabled: boolean;
  onClick: () => void;
}

/** Renders a single pit with seeds. Seeds animate in individually. */
export default function Pit({
  index,
  seeds,
  isValid,
  isLastMove,
  isLastSown,
  isLastCaptured,
  player,
  disabled,
  onClick,
}: PitProps) {
  const canClick = isValid && !disabled;

  return (
    <motion.button
      onClick={canClick ? onClick : undefined}
      disabled={!canClick}
      aria-label={`Pit ${index + 1}: ${seeds} seeds`}
      whileHover={canClick ? { scale: 1.06 } : {}}
      whileTap={canClick ? { scale: 0.95 } : {}}
      className={clsx(
        "relative flex flex-col items-center justify-center rounded-full transition-all duration-200 select-none",
        "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24",
        // Base pit colors
        player === 0
          ? "bg-wood-700"
          : "bg-wood-800",
        // Shadows / depth
        "shadow-pit",
        // Valid move highlight
        isValid && !disabled && [
          "ring-2 ring-yellow-400 ring-offset-2 ring-offset-wood-900",
          "cursor-pointer hover:ring-4",
        ],
        // Last move indicator
        isLastMove && "ring-2 ring-blue-400 ring-offset-1 ring-offset-wood-900",
        // Captured flash
        isLastCaptured && "animate-capture-flash",
        // Disabled state
        !canClick && "cursor-default",
      )}
    >
      {/* Seed count label */}
      <span
        className={clsx(
          "text-lg sm:text-xl font-bold font-display z-10",
          seeds === 0 ? "text-wood-600" : "text-yellow-200",
        )}
      >
        {seeds}
      </span>

      {/* Seed dots (show up to 12 visually) */}
      <SeedDots seeds={seeds} isLastSown={isLastSown} />

      {/* Glow when valid move */}
      {isValid && !disabled && (
        <span className="absolute inset-0 rounded-full bg-yellow-400 opacity-10 animate-pulse" />
      )}
    </motion.button>
  );
}

// ─── Seed Dot Grid ────────────────────────────────────────────────────────────

const DOT_COLORS = [
  "bg-amber-400",
  "bg-yellow-300",
  "bg-amber-500",
  "bg-yellow-400",
  "bg-orange-300",
];

function SeedDots({ seeds, isLastSown }: { seeds: number; isLastSown: boolean }) {
  const display = Math.min(seeds, 12);
  return (
    <div className="absolute inset-1 flex flex-wrap items-center justify-center gap-0.5 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {Array.from({ length: display }, (_, i) => (
          <motion.span
            key={i}
            className={clsx(
              "rounded-full shadow-seed",
              DOT_COLORS[i % DOT_COLORS.length],
              seeds <= 4 ? "w-3 h-3" : seeds <= 8 ? "w-2 h-2" : "w-1.5 h-1.5"
            )}
            initial={isLastSown ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
