import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  walkthroughSteps,
  WalkthroughStep,
  hasCompletedWalkthrough,
  markWalkthroughCompleted,
  resetWalkthrough,
  saveCurrentStep,
  getSavedStep,
  getWalkthroughStepsForRole,
  getProgressPercentage,
} from "@/data/walkthroughSteps";
import { useAuth } from "@/contexts/AuthContext";

export interface WalkthroughContextType {
  // State
  isActive: boolean;
  currentStepIndex: number;
  currentStep: WalkthroughStep | null;
  steps: WalkthroughStep[];
  progress: number;
  hasCompleted: boolean;
  isPaused: boolean;

  // Actions
  startWalkthrough: () => void;
  stopWalkthrough: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipWalkthrough: () => void;
  pauseWalkthrough: () => void;
  resumeWalkthrough: () => void;
  restartWalkthrough: () => void;
}

export const WalkthroughContext = createContext<WalkthroughContextType | undefined>(
  undefined
);

interface WalkthroughProviderProps {
  children: ReactNode;
}

export const WalkthroughProvider: React.FC<WalkthroughProviderProps> = ({
  children,
}) => {
  const { isAdmin, isTeacher, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [steps, setSteps] = useState<WalkthroughStep[]>([]);

  // Initialize steps based on user role
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const roleSteps = getWalkthroughStepsForRole(isAdmin, isTeacher);
      setSteps(roleSteps);
    }
  }, [isAdmin, isTeacher, isAuthenticated, loading]);

  // Check if walkthrough has been completed on mount
  useEffect(() => {
    setHasCompleted(hasCompletedWalkthrough());
  }, []);

  // Auto-start walkthrough for new users (after auth is loaded)
  useEffect(() => {
    if (
      !loading &&
      isAuthenticated &&
      !hasCompletedWalkthrough() &&
      location.pathname === "/" &&
      steps.length > 0
    ) {
      // Small delay to let the dashboard render
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStepIndex(0);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, location.pathname, steps.length]);

  // Save current step when it changes
  useEffect(() => {
    if (isActive) {
      saveCurrentStep(currentStepIndex);
    }
  }, [currentStepIndex, isActive]);

  // Navigate to the step's route if needed
  useEffect(() => {
    if (isActive && !isPaused && steps[currentStepIndex]?.route) {
      const targetRoute = steps[currentStepIndex].route;
      if (targetRoute && location.pathname !== targetRoute) {
        navigate(targetRoute);
      }
    }
  }, [isActive, isPaused, currentStepIndex, steps, location.pathname, navigate]);

  const currentStep = steps[currentStepIndex] || null;
  const progress = steps.length > 0 ? getProgressPercentage(currentStepIndex) : 0;

  const startWalkthrough = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    const savedStep = getSavedStep();
    setCurrentStepIndex(savedStep < steps.length ? savedStep : 0);
  }, [steps.length]);

  const stopWalkthrough = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Completed all steps
      markWalkthroughCompleted();
      setHasCompleted(true);
      setIsActive(false);
    }
  }, [currentStepIndex, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        setCurrentStepIndex(index);
      }
    },
    [steps.length]
  );

  const skipWalkthrough = useCallback(() => {
    markWalkthroughCompleted();
    setHasCompleted(true);
    setIsActive(false);
  }, []);

  const pauseWalkthrough = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeWalkthrough = useCallback(() => {
    setIsPaused(false);
  }, []);

  const restartWalkthrough = useCallback(() => {
    resetWalkthrough();
    setHasCompleted(false);
    setCurrentStepIndex(0);
    setIsPaused(false);
    // Navigate to dashboard first
    if (location.pathname !== "/") {
      navigate("/");
    }
    // Start after a small delay
    setTimeout(() => {
      setIsActive(true);
    }, 500);
  }, [navigate, location.pathname]);

  const value: WalkthroughContextType = {
    isActive,
    currentStepIndex,
    currentStep,
    steps,
    progress,
    hasCompleted,
    isPaused,
    startWalkthrough,
    stopWalkthrough,
    nextStep,
    prevStep,
    goToStep,
    skipWalkthrough,
    pauseWalkthrough,
    resumeWalkthrough,
    restartWalkthrough,
  };

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
    </WalkthroughContext.Provider>
  );
};

export const useWalkthrough = (): WalkthroughContextType => {
  const context = useContext(WalkthroughContext);
  if (context === undefined) {
    throw new Error("useWalkthrough must be used within a WalkthroughProvider");
  }
  return context;
};

// Hook to check if element should be highlighted
export const useWalkthroughHighlight = (elementId: string): boolean => {
  const { isActive, currentStep, isPaused } = useWalkthrough();

  if (!isActive || isPaused || !currentStep) {
    return false;
  }

  // Check if this element's selector matches the current step
  const targetSelector = currentStep.targetSelector;
  if (!targetSelector) {
    return false;
  }

  // Simple check - you might want to make this more robust
  return targetSelector.includes(elementId);
};
