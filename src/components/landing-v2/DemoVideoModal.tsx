"use client";

import { Dialog, DialogContent } from "@/components/ui/Dialog";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoVideoModal = ({ isOpen, onClose }: DemoVideoModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-black/90 border-white/10 overflow-hidden">
        <div className="aspect-video w-full relative">
          {/* Placeholder for actual video source */}
          <div className="absolute inset-0 flex items-center justify-center text-white/50">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
              title="Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
