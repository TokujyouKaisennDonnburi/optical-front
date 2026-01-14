import { Icon } from "@/components/atoms/Icon";
import {
  Activity,
  Calendar,
  Check,
  CheckCircle2,
  Code2,
  GitPullRequest,
  Minus,
  Zap,
} from "@/components/ui/icons";
import { cn } from "@/utils_constants_styles/utils";

export type CalendarWizardTemplate = {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  badge?: string;
  features: Array<{
    label: string;
    included: boolean;
  }>;
};

export type CalendarWizardCustomOption = {
  id: number;
  name: string;
  label: string;
  description: string;
  category: "engineer" | "general";
};

export type CalendarWizardOptionsFormProps = {
  templates: CalendarWizardTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string | null) => void;
  customOptions: CalendarWizardCustomOption[];
  selectedCustomOptions: Record<string, boolean>;
  onToggleCustomOption: (optionId: number) => void;
};

const getOptionIcon = (id: string, _category: string) => {
  // ID specific icons take priority
  switch (id) {
    case "pull_request_review_wait_count":
      return GitPullRequest;
    case "team_review_load":
      return Activity;
    case "milestone_progress":
      return Calendar;
    default:
      return Zap;
  }
};

const getTemplateIcon = (id: string) => {
  switch (id) {
    case "engineer":
      return Code2;
    case "general":
      return Calendar;
    case "simple":
      return Minus;
    default:
      return Calendar;
  }
};

const CATEGORY_LABELS = {
  engineer: "エンジニア・開発",
  general: "一般・便利機能",
};

export function CalendarWizardOptionsForm({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  customOptions,
  selectedCustomOptions,
  onToggleCustomOption,
}: CalendarWizardOptionsFormProps) {
  // Group options by category
  const groupedOptions = customOptions.reduce(
    (acc, option) => {
      const category = option.category || "general";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(option);
      return acc;
    },
    {} as Record<string, CalendarWizardCustomOption[]>,
  );

  // Order of categories to display
  const categoryOrder = ["engineer", "general"];

  return (
    <div className="space-y-10">
      {/* Template Section */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            テンプレートを選択
          </h2>
          <p className="text-muted-foreground text-sm">
            チームやプロジェクトの目的に最適なプリセットを選んでください（任意）。クリックで選択・解除できます。
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {templates.map((template) => {
            const isSelected = template.id === selectedTemplateId;
            const TemplateIcon = getTemplateIcon(template.id);

            return (
              <button
                key={template.id}
                type="button"
                onClick={() =>
                  onSelectTemplate(isSelected ? null : template.id)
                }
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-xl border-2 p-5 text-left transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isSelected
                    ? "scale-[1.02] border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/50",
                )}
              >
                {isSelected && (
                  <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-2 py-1 fade-in-0 zoom-in-95 animate-in duration-200">
                    <Icon
                      icon={CheckCircle2}
                      size="sm"
                      className="text-primary-foreground"
                    />
                  </div>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br shadow-inner transition-colors duration-200",
                      isSelected ? "text-white" : "text-muted-foreground",
                    )}
                    style={{
                      backgroundImage: isSelected
                        ? `linear-gradient(135deg, ${template.accentColor}, ${template.accentColor}dd)`
                        : "none",
                      backgroundColor: isSelected
                        ? undefined
                        : "rgba(0,0,0,0.05)",
                    }}
                  >
                    <Icon icon={TemplateIcon} size="lg" />
                  </div>
                  {template.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm transition-colors duration-200",
                        isSelected
                          ? "bg-background text-foreground"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {template.badge}
                    </span>
                  )}
                </div>

                <div
                  className={cn(
                    "mb-2",
                    template.features.length === 0 && "flex-1 flex flex-col",
                  )}
                >
                  <h3
                    className={cn(
                      "text-lg font-bold transition-colors duration-200",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {template.name}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 text-muted-foreground/90",
                      template.features.length === 0
                        ? "text-sm leading-relaxed whitespace-pre-line"
                        : "text-xs line-clamp-2 min-h-[2.5em]",
                    )}
                  >
                    {template.description}
                  </p>
                </div>

                {template.features.length > 0 && (
                  <div className="mt-auto space-y-2 pt-4">
                    <ul className="space-y-1.5">
                      {template.features.map((feature) => (
                        <li
                          key={`${template.id}-${feature.label}`}
                          className="flex items-start gap-2"
                        >
                          <div className="mt-0.5 shrink-0">
                            {feature.included ? (
                              <Icon
                                icon={Check}
                                size={14}
                                className="text-primary"
                              />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 translate-y-1 translate-x-1" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-xs",
                              feature.included
                                ? "font-medium text-foreground"
                                : "text-muted-foreground/60 line-through decoration-muted-foreground/40",
                            )}
                          >
                            {feature.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Custom Options Section */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            カスタムオプション
          </h2>
          <p className="text-muted-foreground">
            ワークフローに合わせて機能を追加・カスタマイズできます。
          </p>
        </div>

        {categoryOrder.map((category) => {
          const options = groupedOptions[category];
          if (!options || options.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span>
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </span>
                <span className="h-px flex-1 bg-border" />
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {options.map((option) => {
                  const isChecked = Boolean(selectedCustomOptions[option.id]);
                  const OptionIcon = getOptionIcon(
                    option.name,
                    option.category,
                  );

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onToggleCustomOption(option.id)}
                      className={cn(
                        "group relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isChecked
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/30 hover:bg-accent/30",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                          isChecked
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-secondary text-muted-foreground group-hover:bg-secondary/80",
                        )}
                      >
                        <Icon icon={OptionIcon} size="md" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "font-semibold transition-colors",
                              isChecked ? "text-primary" : "text-foreground",
                            )}
                          >
                            {option.label}
                          </span>
                          <div
                            className={cn(
                              "h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors duration-200",
                              isChecked ? "bg-primary" : "bg-muted",
                            )}
                          >
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                                isChecked ? "translate-x-4" : "translate-x-0",
                              )}
                            />
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
