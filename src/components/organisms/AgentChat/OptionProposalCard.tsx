import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";

export type OptionProposalProps = {
  id: string | number;
  name: string;
  description: string;
};

export function OptionProposalCard({
  id: _id,
  name,
  description,
}: OptionProposalProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "installed">(
    "idle",
  );

  const handleInstall = (): void => {
    setStatus("loading");
    // Simulate network request
    setTimeout(() => {
      setStatus("installed");
    }, 1500);
  };

  return (
    <div className="border border-white/20 rounded-lg p-3 bg-card text-card-foreground shadow-sm max-w-[280px]">
      <div className="mb-2">
        <Text size="sm" weight="semibold" className="text-foreground">
          {name}
        </Text>
        <Text size="sm" className="text-muted-foreground mt-1 leading-snug">
          {description}
        </Text>
      </div>
      <div className="flex justify-end mt-3">
        {status === "installed" ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-green-500 hover:text-green-600 hover:bg-green-500/10"
            disabled
          >
            <Check size={14} className="mr-1.5" />
            導入済み
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleInstall}
            disabled={status === "loading"}
          >
            {status === "loading" && (
              <Loader2 size={12} className="mr-1.5 animate-spin" />
            )}
            {status === "loading" ? "導入中..." : "導入する"}
          </Button>
        )}
      </div>
    </div>
  );
}
