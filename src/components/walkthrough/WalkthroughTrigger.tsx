import React from "react";
import { useWalkthrough } from "@/contexts/WalkthroughContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  PlayCircle,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WalkthroughTriggerProps {
  variant?: "button" | "card" | "compact";
  className?: string;
}

export const WalkthroughTrigger: React.FC<WalkthroughTriggerProps> = ({
  variant = "card",
  className,
}) => {
  const { restartWalkthrough, hasCompleted, isActive } = useWalkthrough();

  const handleClick = () => {
    if (!isActive) {
      restartWalkthrough();
    }
  };

  // Button variant - simple button
  if (variant === "button") {
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={isActive}
        className={cn("gap-2", className)}
      >
        {hasCompleted ? (
          <>
            <RotateCcw className="w-4 h-4" />
            Restart Tour
          </>
        ) : (
          <>
            <PlayCircle className="w-4 h-4" />
            Start Tour
          </>
        )}
      </Button>
    );
  }

  // Compact variant - smaller inline button
  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        disabled={isActive}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50",
          className
        )}
      >
        <HelpCircle className="w-4 h-4" />
        <span>{hasCompleted ? "Restart Tour" : "Take a Tour"}</span>
      </button>
    );
  }

  // Card variant - full card display
  return (
    <Card className={cn("border-border/50 shadow-sm overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Platform Tour
                {hasCompleted && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                Get familiar with the platform features
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          {hasCompleted
            ? "You've completed the tour! Want to go through it again to refresh your memory?"
            : "New here? Take a guided tour to learn how to navigate and use all the features of this platform."}
        </p>
        <Button
          onClick={handleClick}
          disabled={isActive}
          className="w-full gap-2"
          variant={hasCompleted ? "outline" : "default"}
        >
          {hasCompleted ? (
            <>
              <RotateCcw className="w-4 h-4" />
              Restart Tour
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Start Guided Tour
            </>
          )}
        </Button>
        {isActive && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Tour is currently in progress...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WalkthroughTrigger;
