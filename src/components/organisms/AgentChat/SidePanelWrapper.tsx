"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

/** サイドパネルのデフォルト幅（px） */
const SIDE_PANEL_DEFAULT_WIDTH = 400;

/** アニメーション設定 */
const ANIMATION = {
  /** パネルのスプリングアニメーション設定 */
  panel: {
    type: "spring" as const,
    damping: 30,
    stiffness: 300,
  },
} as const;

type SidePanelWrapperProps = {
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  /** パネルの幅（px）。デフォルトは400px */
  width?: number;
};

export function SidePanelWrapper({
  isOpen,
  onToggle: _onToggle,
  children,
  width = SIDE_PANEL_DEFAULT_WIDTH,
}: SidePanelWrapperProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={ANIMATION.panel}
          className="flex-shrink-0 border-l border-border bg-card h-full overflow-hidden shadow-xl"
          data-id="side-panel-wrapper"
        >
          <div className="flex h-full flex-col" style={{ width }}>
            {/* Content passed from parent */}
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
