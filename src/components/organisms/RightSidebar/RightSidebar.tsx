import {
  GitPullRequest,
  ListTodo,
  Milestone,
  Plus,
  Sheet,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/utils_constants_styles/utils";

export interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortLabel: string;
}

// オプションIDとサイドバー表示のマッピング
const OPTION_CONFIG: Record<
  string,
  {
    sidebarId: string;
    icon: React.ReactNode;
    label: string;
    shortLabel: string;
  }
> = {
  todo: {
    sidebarId: "todo",
    icon: <ListTodo size={18} />,
    label: "ToDo",
    shortLabel: "ToDo",
  },
  pull_request_review_wait_count: {
    sidebarId: "pr-review",
    icon: <GitPullRequest size={18} />,
    label: "PRレビュー",
    shortLabel: "PR",
  },
  team_review_load: {
    sidebarId: "team-load",
    icon: <Users size={18} />,
    label: "レビュー負荷",
    shortLabel: "負荷",
  },
  milestone_progress: {
    sidebarId: "milestone",
    icon: <Milestone size={18} />,
    label: "マイルストーン",
    shortLabel: "MS",
  },
  scheduler: {
    sidebarId: "scheduler",
    icon: <Sheet size={20} />,
    label: "Scheduler",
    shortLabel: "調整",
  },
};

interface RightSidebarProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
  installedOptions?: string[];
}

export function RightSidebar({
  selectedId,
  onSelect,
  className,
  installedOptions = [],
}: RightSidebarProps) {
  // installedOptions から表示するアイテムを動的に生成
  const optionItems: SidebarItem[] = useMemo(() => {
    return installedOptions
      .map((optionId) => {
        const config = OPTION_CONFIG[optionId];
        if (!config) return null;
        return {
          id: config.sidebarId,
          icon: config.icon,
          label: config.label,
          shortLabel: config.shortLabel,
        };
      })
      .filter((item): item is SidebarItem => item !== null);
  }, [installedOptions]);

  return (
    <div
      className={cn(
        "flex w-[72px] flex-col items-center bg-background/95 backdrop-blur-sm border-l border-border py-3 z-20",
        "shadow-[-4px_0_16px_-4px_rgba(0,0,0,0.08)]",
        "dark:shadow-[-4px_0_16px_-4px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      {/* AI Agent Button (Fixed at Top) */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => onSelect("agent")}
          className={cn(
            "group flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200",
            "hover:bg-primary/10",
            selectedId === "agent" && "bg-primary/15",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
              "group-hover:scale-105 group-hover:shadow-md",
              selectedId === "agent"
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
            )}
          >
            <Sparkles size={18} />
          </div>
          <span
            className={cn(
              "text-[10px] font-medium leading-tight transition-colors duration-200",
              selectedId === "agent"
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          >
            Agent
          </span>
        </button>
      </div>

      {/* Separator with gradient */}
      <div className="w-10 h-px my-2 bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Installed Options */}
      <div className="flex flex-col items-center gap-1 w-full flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-1">
        {optionItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "group flex flex-col items-center gap-1 w-full px-1.5 py-2 rounded-xl transition-all duration-200",
              "hover:bg-accent/50",
              selectedId === item.id && "bg-accent/70",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                "group-hover:scale-105 group-hover:shadow-md",
                selectedId === item.id
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-muted/40 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
              )}
            >
              {item.icon}
            </div>
            <span
              className={cn(
                "text-[9px] font-medium leading-tight text-center max-w-full truncate transition-colors duration-200",
                selectedId === item.id
                  ? "text-foreground"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
              title={item.label}
            >
              {item.shortLabel}
            </span>
          </button>
        ))}
      </div>

      {/* Add Option Button (Bottom) */}
      <div className="flex flex-col items-center mt-auto pt-2">
        <div className="w-10 h-px mb-2 bg-gradient-to-r from-transparent via-border to-transparent" />
        <button
          type="button"
          onClick={() => onSelect("add-option")}
          className={cn(
            "group flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200",
            "hover:bg-muted/80",
            selectedId === "add-option" && "bg-muted",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
              "border-2 border-dashed",
              "group-hover:scale-105 group-hover:border-primary group-hover:text-primary",
              selectedId === "add-option"
                ? "border-primary text-primary bg-primary/10"
                : "border-muted-foreground/40 text-muted-foreground",
            )}
          >
            <Plus size={18} />
          </div>
          <span
            className={cn(
              "text-[9px] font-medium leading-tight transition-colors duration-200",
              selectedId === "add-option"
                ? "text-primary"
                : "text-muted-foreground group-hover:text-primary",
            )}
          >
            追加
          </span>
        </button>
      </div>
    </div>
  );
}
