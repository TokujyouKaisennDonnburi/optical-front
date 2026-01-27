"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle } from "@/components/atoms/Dialog";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoVideoModal = ({ isOpen, onClose }: DemoVideoModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[50rem] p-0 bg-black/90 border-white/10 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>デモ動画</DialogTitle>
        </VisuallyHidden>
        <div className="aspect-video w-full relative">
          <video className="w-full h-full" controls autoPlay muted loop>
            <source src="/optical-demo.mp4" type="video/mp4" />
            お使いのブラウザは動画タグをサポートしていません。
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
};
