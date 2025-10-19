import * as React from "react";
import {
  Avatar as UIAvatar,
  AvatarFallback as UIAvatarFallback,
  AvatarImage as UIAvatarImage,
} from "@/components/ui/Avatar";

export const Avatar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIAvatar>
>((props, ref) => <UIAvatar ref={ref} {...props} />);
Avatar.displayName = "AtomsAvatar";

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<typeof UIAvatarImage>
>((props, ref) => <UIAvatarImage ref={ref} {...props} />);
AvatarImage.displayName = "AtomsAvatarImage";

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIAvatarFallback>
>((props, ref) => <UIAvatarFallback ref={ref} {...props} />);
AvatarFallback.displayName = "AtomsAvatarFallback";
