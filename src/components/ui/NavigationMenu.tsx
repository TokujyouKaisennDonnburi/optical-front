import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cloneElement, createContext, isValidElement, useContext, useId, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/utils_constants_styles/utils";

const navigationMenuTriggerStyle = cn(
  "inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50",
  "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground"
);

type NavigationMenuState = {
  openItem: string | null;
  setOpenItem: (value: string | null) => void;
};

const NavigationMenuContext = createContext<NavigationMenuState | null>(null);
const ItemContext = createContext<string | null>(null);

type NavigationMenuProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

function NavigationMenu({ className, children }: NavigationMenuProps) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const value = useMemo(() => ({ openItem, setOpenItem }), [openItem]);

  return (
    <NavigationMenuContext.Provider value={value}>
      <nav className={cn("relative w-full", className)}>{children}</nav>
    </NavigationMenuContext.Provider>
  );
}

type NavigationMenuListProps = HTMLAttributes<HTMLUListElement> & {
  children: ReactNode;
};

function NavigationMenuList({ className, children }: NavigationMenuListProps) {
  return <ul className={cn("flex flex-wrap items-center gap-1", className)}>{children}</ul>;
}

type NavigationMenuItemProps = HTMLAttributes<HTMLLIElement> & {
  children: ReactNode;
};

function NavigationMenuItem({ className, children }: NavigationMenuItemProps) {
  const id = useId();
  return (
    <ItemContext.Provider value={id}>
      <li className={cn("relative", className)}>{children}</li>
    </ItemContext.Provider>
  );
}

type NavigationMenuTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

function NavigationMenuTrigger({ className, children, ...props }: NavigationMenuTriggerProps) {
  const { openItem, setOpenItem } = useNavigationMenu();
  const id = useItem();
  const isOpen = openItem === id;

  return (
    <button
      type="button"
      className={cn(navigationMenuTriggerStyle, "group", className)}
      aria-expanded={isOpen}
      onClick={() => setOpenItem(isOpen ? null : id)}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown className={cn("ml-1 h-3 w-3 transition-transform", isOpen && "rotate-180")} />
    </button>
  );
}

type NavigationMenuContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

function NavigationMenuContent({ className, children }: NavigationMenuContentProps) {
  const { openItem } = useNavigationMenu();
  const id = useItem();
  const isOpen = openItem === id;

  if (!isOpen) return null;

  return (
    <div className={cn("absolute left-0 top-full z-20 mt-2 min-w-[220px] rounded-md border bg-popover p-4 shadow-lg", className)}>
      {children}
    </div>
  );
}

type NavigationMenuLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  asChild?: boolean;
  children: ReactNode;
};

function NavigationMenuLink({ asChild, className, children, ...props }: NavigationMenuLinkProps) {
  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      className: cn(children.props.className, className),
    });
  }
  return (
    <a className={cn("text-sm", className)} {...props}>
      {children}
    </a>
  );
}

function NavigationMenuIndicator({ className }: HTMLAttributes<HTMLDivElement>) {
  const { openItem } = useNavigationMenu();
  return openItem ? <div className={cn("mt-2 h-0.5 w-12 bg-primary", className)} aria-hidden /> : null;
}

function NavigationMenuViewport({ className, children }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative", className)}>{children}</div>;
}

function useNavigationMenu() {
  const context = useContext(NavigationMenuContext);
  if (!context) {
    throw new Error("NavigationMenu components must be used within <NavigationMenu>");
  }
  return context;
}

function useItem() {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error("NavigationMenuTrigger must be used inside NavigationMenuItem");
  }
  return context;
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
