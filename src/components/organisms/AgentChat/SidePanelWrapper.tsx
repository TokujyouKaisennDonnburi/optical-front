"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/atoms/Button";

type SidePanelWrapperProps = {
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function SidePanelWrapper({
  isOpen,
  onToggle,
  children,
}: SidePanelWrapperProps) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="flex-shrink-0 border border-border bg-card h-full overflow-hidden shadow-xl rounded-xl"
            data-id="side-panel-wrapper"
          >
            <div className="flex h-full w-[400px] flex-col">
              {/* Content passed from parent */}
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button (only visible when closed) */}
      <motion.div
        className="fixed bottom-6 right-6 z-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {!isOpen && (
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-300"
            onClick={onToggle}
            data-id="agent-trigger-fab"
          >
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </Button>
        )}
      </motion.div>
    </>
  );
}
