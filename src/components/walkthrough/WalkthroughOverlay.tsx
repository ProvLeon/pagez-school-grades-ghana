import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useWalkthrough } from "@/contexts/WalkthroughContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  X,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const WalkthroughOverlay: React.FC = () => {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    steps,
    progress,
    isPaused,
    nextStep,
    prevStep,
    skipWalkthrough,
    stopWalkthrough,
  } = useWalkthrough();

  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate spotlight and tooltip positions
  const calculatePositions = useCallback(() => {
    if (!currentStep || isPaused) {
      setSpotlightRect(null);
      return;
    }

    // For center placement (welcome/completion screens), no spotlight
    if (currentStep.placement === "center" || !currentStep.targetSelector) {
      setSpotlightRect(null);
      // Center the tooltip
      setTooltipPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
      });
      return;
    }

    // Find the target element
    const targetElement = document.querySelector(currentStep.targetSelector);
    if (!targetElement) {
      // Element not found, show centered tooltip
      setSpotlightRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
      });
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const padding = currentStep.spotlightPadding || 8;

    // Set spotlight rectangle
    setSpotlightRect({
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Calculate tooltip position based on placement
    const tooltipWidth = 400;
    const tooltipHeight = 280;
    const margin = 16;

    let newTop = 0;
    let newLeft = 0;

    switch (currentStep.placement) {
      case "top":
        newTop = rect.top + window.scrollY - tooltipHeight - margin;
        newLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        newTop = rect.bottom + window.scrollY + margin;
        newLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        newTop = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
        newLeft = rect.left - tooltipWidth - margin;
        break;
      case "right":
        newTop = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
        newLeft = rect.right + margin;
        break;
      default:
        newTop = rect.bottom + window.scrollY + margin;
        newLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    }

    // Ensure tooltip stays within viewport
    newLeft = Math.max(margin, Math.min(newLeft, window.innerWidth - tooltipWidth - margin));
    newTop = Math.max(margin, Math.min(newTop, window.innerHeight + window.scrollY - tooltipHeight - margin));

    setTooltipPosition({ top: newTop, left: newLeft });
  }, [currentStep, isPaused]);

  // Recalculate on step change or window resize
  useEffect(() => {
    if (!isActive) return;

    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);

    calculatePositions();

    const handleResize = () => calculatePositions();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [isActive, currentStepIndex, calculatePositions]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "Enter":
          e.preventDefault();
          nextStep();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevStep();
          break;
        case "Escape":
          e.preventDefault();
          skipWalkthrough();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextStep, prevStep, skipWalkthrough]);

  if (!isActive || !currentStep || isPaused) {
    return null;
  }

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isCentered = currentStep.placement === "center";
  const StepIcon = currentStep.icon;

  const overlayContent = (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Backdrop overlay with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ minHeight: "100vh" }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx="8"
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </svg>

      {/* Spotlight border highlight */}
      {spotlightRect && (
        <div
          className="absolute border-2 border-primary rounded-lg transition-all duration-300 ease-out pointer-events-none"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            boxShadow: "0 0 0 4px rgba(var(--primary), 0.2), 0 0 20px rgba(var(--primary), 0.3)",
          }}
        />
      )}

      {/* Tooltip/Card */}
      <div
        ref={tooltipRef}
        className={cn(
          "absolute pointer-events-auto transition-all duration-300 ease-out",
          isAnimating && "opacity-0 scale-95",
          !isAnimating && "opacity-100 scale-100",
          isCentered && "transform -translate-x-1/2 -translate-y-1/2"
        )}
        style={{
          top: isCentered ? "50%" : tooltipPosition.top,
          left: isCentered ? "50%" : tooltipPosition.left,
          width: isCentered ? "min(90vw, 480px)" : "min(90vw, 400px)",
        }}
      >
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary to-primary/80 px-5 py-4">
            <button
              onClick={stopWalkthrough}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close walkthrough"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="flex items-center gap-3">
              {StepIcon ? (
                <div className="p-2 bg-white/20 rounded-lg">
                  <StepIcon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {currentStep.title}
                </h3>
                <p className="text-xs text-white/70">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>

            {/* Step indicators for centered views */}
            {isCentered && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {steps.map((_, index) => (
                  <div key={index} className="flex items-center">
                    {index < currentStepIndex ? (
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    ) : index === currentStepIndex ? (
                      <Circle className="w-3 h-3 text-primary fill-primary" />
                    ) : (
                      <Circle className="w-3 h-3 text-muted-foreground/30" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="px-5">
            <Progress value={progress} className="h-1" />
          </div>

          {/* Actions */}
          <div className="px-5 py-4 flex items-center justify-between gap-3 bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipWalkthrough}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="w-4 h-4 mr-1.5" />
              Skip tour
            </Button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}

              <Button
                size="sm"
                onClick={nextStep}
                className="gap-1.5 min-w-[100px]"
              >
                {isLastStep ? (
                  <>
                    Finish
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="px-5 py-2 border-t border-border bg-muted/20">
            <p className="text-[10px] text-muted-foreground text-center">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">→</kbd> for next,{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">←</kbd> for back,{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd> to skip
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
};

export default WalkthroughOverlay;
