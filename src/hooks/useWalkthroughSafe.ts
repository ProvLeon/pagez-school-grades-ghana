import { useContext } from "react";
import { WalkthroughContext, WalkthroughContextType } from "@/contexts/WalkthroughContext";
import { WalkthroughStep } from "@/data/walkthroughSteps";

// Default/fallback values when outside provider
const defaultWalkthroughContext: WalkthroughContextType = {
  isActive: false,
  currentStepIndex: 0,
  currentStep: null,
  steps: [] as WalkthroughStep[],
  progress: 0,
  hasCompleted: false,
  isPaused: false,
  startWalkthrough: () => { },
  stopWalkthrough: () => { },
  nextStep: () => { },
  prevStep: () => { },
  goToStep: (_index: number) => { },
  skipWalkthrough: () => { },
  pauseWalkthrough: () => { },
  resumeWalkthrough: () => { },
  restartWalkthrough: () => { },
};

/**
 * Safe version of useWalkthrough that returns default values
 * when used outside of WalkthroughProvider.
 *
 * Use this in components that might be rendered before the
 * WalkthroughProvider is available (e.g., during initial render).
 */
export const useWalkthroughSafe = (): WalkthroughContextType => {
  const context = useContext(WalkthroughContext);

  // Return default context if provider is not available
  if (context === undefined) {
    return defaultWalkthroughContext;
  }

  return context;
};

export default useWalkthroughSafe;
