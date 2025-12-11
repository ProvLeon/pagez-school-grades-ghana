import React from "react";
import { useWalkthrough } from "@/contexts/WalkthroughContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Rocket,
  GraduationCap,
  Users,
  FileText,
  Settings,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
}

const features = [
  {
    icon: GraduationCap,
    title: "Manage Classes",
    description: "Organize your school structure",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Users,
    title: "Track Students",
    description: "Keep student records updated",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: FileText,
    title: "Record Results",
    description: "Manage grades and assessments",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Settings,
    title: "Customize Settings",
    description: "Tailor the system to your needs",
    color: "bg-orange-500/10 text-orange-600",
  },
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  open,
  onOpenChange,
  userName = "there",
}) => {
  const { startWalkthrough, hasCompleted } = useWalkthrough();

  const handleStartTour = () => {
    onOpenChange(false);
    // Small delay to let the modal close
    setTimeout(() => {
      startWalkthrough();
    }, 300);
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  // Don't show if user has already completed the walkthrough
  if (hasCompleted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-0">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 px-6 py-8 text-white">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-white/80 uppercase tracking-wider">
                Welcome
              </span>
            </div>

            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-white">
                Hello, {userName}!
              </DialogTitle>
              <DialogDescription className="text-white/80 text-base">
                Welcome to your school management dashboard. Let us show you around!
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-sm text-muted-foreground mb-5">
            With PB Pagez, you can manage all aspects of your school in one place:
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border border-border/50",
                  "hover:border-primary/30 hover:bg-primary/5 transition-colors"
                )}
              >
                <div className={cn("p-2 rounded-lg shrink-0", feature.color)}>
                  <feature.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-foreground">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={handleStartTour}
              className="w-full sm:w-auto gap-2 h-11"
              size="lg"
            >
              <Rocket className="w-4 h-4" />
              Start Guided Tour
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
            >
              I'll explore on my own
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t border-border/50">
            You can restart the tour anytime from your{" "}
            <span className="text-primary font-medium">Profile</span> or{" "}
            <span className="text-primary font-medium">Settings</span> page.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
