import { GitPullRequest, Milestone, Plus, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/utils_constants_styles/utils";

export interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

// オプションIDとサイドバー表示のマッピング
const OPTION_CONFIG: Record<
  string,
  { sidebarId: string; icon: React.ReactNode; label: string }
> = {
  pull_request_review_wait_count: {
    sidebarId: "pr-review",
    icon: <GitPullRequest size={20} />,
    label: "PR Reviews",
  },
  team_review_load: {
    sidebarId: "team-load",
    icon: <Users size={20} />,
    label: "Team Load",
  },
  milestone_progress: {
    sidebarId: "milestone",
    icon: <Milestone size={20} />,
    label: "Milestones",
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
        };
      })
      .filter((item): item is SidebarItem => item !== null);
  }, [installedOptions]);

  return (
    <div
      className={cn(
        "flex w-[60px] flex-col items-center gap-4 bg-background border-l border-border py-4 z-20 shadow-sm",
        className,
      )}
    >
      {/* AI Agent Button (Fixed at Top) */}
      <div className="flex flex-col items-center gap-2">
        <Button
          variant={selectedId === "agent" ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full transition-all duration-200",
            selectedId === "agent" &&
              "bg-primary/10 text-primary hover:bg-primary/20",
          )}
          onClick={() => onSelect("agent")}
          title="AI Agent"
        >
          <Sparkles size={20} />
        </Button>
      </div>

      {/* Separator */}
      <div className="h-[1px] w-8 bg-border" />

      {/* Installed Options */}
      <div className="flex flex-col items-center gap-3 w-full flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-2">
        {optionItems.map((item) => (
          <Button
            key={item.id}
            variant={selectedId === item.id ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full transition-all duration-200",
              selectedId === item.id && "bg-accent text-accent-foreground",
            )}
            onClick={() => onSelect(item.id)}
            title={item.label}
          >
            {item.icon}
          </Button>
        ))}
      </div>

      {/* Add Option Button (Bottom) */}
      <div className="mt-auto flex flex-col items-center pb-2">
        <div className="h-[1px] w-8 bg-border mb-4" />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-muted"
          onClick={() => onSelect("add-option")}
          title="Add Option"
        >
          <Plus size={22} />
        </Button>
      </div>
    </div>
  );
}
