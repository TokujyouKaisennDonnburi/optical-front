import * as React from "react";
import {
  Dialog as UIDialog,
  DialogTrigger as UIDialogTrigger,
  DialogPortal as UIDialogPortal,
  DialogClose as UIDialogClose,
  DialogOverlay as UIDialogOverlay,
  DialogContent as UIDialogContent,
  DialogHeader as UIDialogHeader,
  DialogFooter as UIDialogFooter,
  DialogTitle as UIDialogTitle,
  DialogDescription as UIDialogDescription,
} from "@/components/ui/Dialog";

export const Dialog = UIDialog;
export const DialogTrigger = UIDialogTrigger;
export const DialogPortal = UIDialogPortal;
export const DialogClose = UIDialogClose;

export const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIDialogOverlay>
>((props, ref) => <UIDialogOverlay ref={ref} {...props} />);
DialogOverlay.displayName = "AtomsDialogOverlay";

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIDialogContent>
>((props, ref) => <UIDialogContent ref={ref} {...props} />);
DialogContent.displayName = "AtomsDialogContent";

export const DialogHeader = UIDialogHeader;
export const DialogFooter = UIDialogFooter;

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof UIDialogTitle>
>((props, ref) => <UIDialogTitle ref={ref} {...props} />);
DialogTitle.displayName = "AtomsDialogTitle";

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof UIDialogDescription>
>((props, ref) => <UIDialogDescription ref={ref} {...props} />);
DialogDescription.displayName = "AtomsDialogDescription";
