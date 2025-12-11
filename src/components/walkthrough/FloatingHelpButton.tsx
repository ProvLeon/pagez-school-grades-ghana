import React, { useState } from "react";
import { useWalkthrough } from "@/contexts/WalkthroughContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HelpCircle,
  PlayCircle,
  RotateCcw,
  BookOpen,
  MessageCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingHelpButtonProps {
  className?: string;
  showOnMobile?: boolean;
}

export const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({
  className,
  showOnMobile = false,
}) => {
  const { restartWalkthrough, hasCompleted, isActive } = useWalkthrough();
  const [isOpen, setIsOpen] = useState(false);

  const handleStartTour = () => {
    setIsOpen(false);
    if (!isActive) {
      restartWalkthrough();
    }
  };

  // Don't show during walkthrough
  if (isActive) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        !showOnMobile && "hidden md:block",
        className
      )}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "h-10 w-10 px-2 rounded-full shadow-lg",
              "bg-primary hover:bg-primary/90",
              "transition-all duration-300 ease-out",
              "hover:scale-105 hover:shadow-xl",
              "focus:ring-4 focus:ring-primary/30"
            )}
            aria-label="Help menu"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <HelpCircle className="h-6 w-6" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="top"
          sideOffset={16}
          className="w-72 p-0 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3">
            <h3 className="font-semibold text-white text-sm">Need Help?</h3>
            <p className="text-white/70 text-xs">
              Quick access to assistance
            </p>
          </div>

          {/* Options */}
          <div className="p-2 space-y-1">
            <button
              onClick={handleStartTour}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "text-left text-sm transition-colors",
                "hover:bg-primary/10 group"
              )}
            >
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                {hasCompleted ? (
                  <RotateCcw className="w-4 h-4 text-primary" />
                ) : (
                  <PlayCircle className="w-4 h-4 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {hasCompleted ? "Restart Tour" : "Take a Tour"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasCompleted
                    ? "Go through the guided tour again"
                    : "Learn how to use the platform"}
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // You could open a documentation page or help center here
                window.open("/docs", "_blank");
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "text-left text-sm transition-colors",
                "hover:bg-accent group"
              )}
            >
              <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Documentation</p>
                <p className="text-xs text-muted-foreground">
                  Read detailed guides and FAQs
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // You could open a contact form or support chat here
                window.location.href = "mailto:support@pbpagez.com";
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "text-left text-sm transition-colors",
                "hover:bg-accent group"
              )}
            >
              <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Contact Support</p>
                <p className="text-xs text-muted-foreground">
                  Get help from our team
                </p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <p className="text-[10px] text-muted-foreground text-center">
              Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">?</kbd> anytime for keyboard shortcuts
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FloatingHelpButton;
