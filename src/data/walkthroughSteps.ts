import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  Settings,
  ClipboardList,
  ArrowLeftRight,
  UserCheck,
  Bell,
  Moon,
  User,
  LucideIcon,
} from "lucide-react";

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  targetSelector?: string; // CSS selector for the element to highlight
  placement?: "top" | "bottom" | "left" | "right" | "center";
  route?: string; // Route to navigate to for this step
  category: "welcome" | "navigation" | "features" | "settings" | "completion";
  spotlightPadding?: number;
  requiresClick?: boolean; // If user needs to click the target
  action?: "click" | "hover" | "none";
}

export const walkthroughSteps: WalkthroughStep[] = [
  // Welcome Section
  {
    id: "welcome",
    title: "Welcome to PB Pagez!",
    description:
      "Let's take a quick tour to help you get familiar with your school management system. This will only take a few minutes.",
    placement: "center",
    category: "welcome",
  },

  // Dashboard Overview
  {
    id: "dashboard-overview",
    title: "Your Dashboard",
    description:
      "This is your command center. Here you can see an overview of your school's statistics, recent activities, and quick actions.",
    icon: LayoutDashboard,
    targetSelector: '[data-tour="dashboard-stats"]',
    placement: "bottom",
    route: "/",
    category: "features",
    spotlightPadding: 16,
  },

  // Sidebar Navigation
  {
    id: "sidebar-navigation",
    title: "Navigation Sidebar",
    description:
      "Use the sidebar to navigate between different sections of the system. Click on any menu item to access that feature.",
    targetSelector: '[data-tour="sidebar"]',
    placement: "right",
    category: "navigation",
    spotlightPadding: 8,
  },

  // Classes Section
  {
    id: "classes-section",
    title: "Classes Management",
    description:
      "Manage all your school classes here. You can create new classes, edit existing ones, and assign students to specific classes.",
    icon: GraduationCap,
    targetSelector: '[data-tour="sidebar-classes"]',
    placement: "right",
    route: "/classes",
    category: "features",
  },

  // Subjects Section
  {
    id: "subjects-section",
    title: "Subjects & Departments",
    description:
      "Organize your curriculum by managing subjects, departments, and subject combinations. This helps in structuring your academic programs.",
    icon: BookOpen,
    targetSelector: '[data-tour="sidebar-subjects"]',
    placement: "right",
    category: "features",
  },

  // Students Section
  {
    id: "students-section",
    title: "Student Management",
    description:
      "Add, edit, and manage all student records. You can also import students in bulk using Excel files and manage their profiles.",
    icon: Users,
    targetSelector: '[data-tour="sidebar-students"]',
    placement: "right",
    category: "features",
  },

  // Results Section
  {
    id: "results-section",
    title: "Results & Grading",
    description:
      "Record and manage student results. Configure grading settings, add continuous assessment scores, and generate report cards.",
    icon: FileText,
    targetSelector: '[data-tour="sidebar-results"]',
    placement: "right",
    category: "features",
  },

  // Manage Sheets
  {
    id: "sheets-section",
    title: "Manage Sheets",
    description:
      "Generate and manage broadsheets, terminal reports, and other academic documents for printing or digital distribution.",
    icon: ClipboardList,
    targetSelector: '[data-tour="sidebar-sheets"]',
    placement: "right",
    category: "features",
  },

  // Transfers
  {
    id: "transfers-section",
    title: "Student Transfers",
    description:
      "Handle student transfers between classes or schools. Keep track of all transfer records and their status.",
    icon: ArrowLeftRight,
    targetSelector: '[data-tour="sidebar-transfers"]',
    placement: "right",
    category: "features",
  },

  // Teacher Management
  {
    id: "teachers-section",
    title: "Teacher Management",
    description:
      "Add and manage teacher accounts. Assign teachers to classes and subjects, and control their access permissions.",
    icon: UserCheck,
    targetSelector: '[data-tour="sidebar-teachers"]',
    placement: "right",
    category: "features",
  },

  // Header Actions
  {
    id: "header-actions",
    title: "Quick Actions",
    description:
      "Access notifications, toggle dark/light mode, and manage your profile from the header. These are always available from any page.",
    targetSelector: '[data-tour="header-actions"]',
    placement: "bottom",
    category: "navigation",
    spotlightPadding: 8,
  },

  // Notifications
  {
    id: "notifications",
    title: "Stay Updated",
    description:
      "Click the bell icon to see your notifications. You'll be alerted about important events, pending tasks, and system updates.",
    icon: Bell,
    targetSelector: '[data-tour="notifications"]',
    placement: "bottom",
    category: "features",
  },

  // Theme Toggle
  {
    id: "theme-toggle",
    title: "Dark/Light Mode",
    description:
      "Toggle between dark and light mode based on your preference. Your choice will be saved for future sessions.",
    icon: Moon,
    targetSelector: '[data-tour="theme-toggle"]',
    placement: "bottom",
    category: "settings",
  },

  // User Profile
  {
    id: "user-profile",
    title: "Your Profile",
    description:
      "Access your profile settings, update your information, or sign out from here. You can also restart this tour from your profile page.",
    icon: User,
    targetSelector: '[data-tour="user-menu"]',
    placement: "bottom",
    category: "settings",
  },

  // Settings
  {
    id: "settings-section",
    title: "School Settings",
    description:
      "Configure your school's information, logo, theme colors, and other system-wide settings. Only administrators can access this section.",
    icon: Settings,
    targetSelector: '[data-tour="sidebar-settings"]',
    placement: "right",
    category: "settings",
  },

  // Completion
  {
    id: "completion",
    title: "You're All Set!",
    description:
      "You've completed the tour! You can restart it anytime from your Profile page. Now let's get started with managing your school.",
    placement: "center",
    category: "completion",
  },
];

// Get steps by category
export const getStepsByCategory = (category: WalkthroughStep["category"]) => {
  return walkthroughSteps.filter((step) => step.category === category);
};

// Get step by ID
export const getStepById = (id: string) => {
  return walkthroughSteps.find((step) => step.id === id);
};

// Get step index
export const getStepIndex = (id: string) => {
  return walkthroughSteps.findIndex((step) => step.id === id);
};

// Get progress percentage
export const getProgressPercentage = (currentStepIndex: number) => {
  return Math.round(((currentStepIndex + 1) / walkthroughSteps.length) * 100);
};

// Compact walkthrough for quick refresh (fewer steps)
export const compactWalkthroughSteps: WalkthroughStep[] = [
  walkthroughSteps[0], // Welcome
  walkthroughSteps[1], // Dashboard
  walkthroughSteps[2], // Sidebar
  walkthroughSteps[5], // Students
  walkthroughSteps[6], // Results
  walkthroughSteps[walkthroughSteps.length - 1], // Completion
];

// Get walkthrough steps based on user role
export const getWalkthroughStepsForRole = (
  isAdmin: boolean,
  isTeacher: boolean
): WalkthroughStep[] => {
  if (isTeacher && !isAdmin) {
    // Teachers see limited steps
    return walkthroughSteps.filter(
      (step) =>
        step.category === "welcome" ||
        step.category === "completion" ||
        step.id === "dashboard-overview" ||
        step.id === "sidebar-navigation" ||
        step.id === "results-section" ||
        step.id === "header-actions" ||
        step.id === "theme-toggle" ||
        step.id === "user-profile"
    );
  }

  // Admins see all steps
  return walkthroughSteps;
};

// Local storage keys
export const WALKTHROUGH_STORAGE_KEY = "pagez_walkthrough_completed";
export const WALKTHROUGH_STEP_KEY = "pagez_walkthrough_current_step";
export const WALKTHROUGH_SKIPPED_KEY = "pagez_walkthrough_skipped";

// Check if walkthrough has been completed
export const hasCompletedWalkthrough = (): boolean => {
  try {
    return localStorage.getItem(WALKTHROUGH_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

// Mark walkthrough as completed
export const markWalkthroughCompleted = (): void => {
  try {
    localStorage.setItem(WALKTHROUGH_STORAGE_KEY, "true");
    localStorage.removeItem(WALKTHROUGH_STEP_KEY);
  } catch {
    // Ignore localStorage errors
  }
};

// Reset walkthrough
export const resetWalkthrough = (): void => {
  try {
    localStorage.removeItem(WALKTHROUGH_STORAGE_KEY);
    localStorage.removeItem(WALKTHROUGH_STEP_KEY);
    localStorage.removeItem(WALKTHROUGH_SKIPPED_KEY);
  } catch {
    // Ignore localStorage errors
  }
};

// Save current step
export const saveCurrentStep = (stepIndex: number): void => {
  try {
    localStorage.setItem(WALKTHROUGH_STEP_KEY, stepIndex.toString());
  } catch {
    // Ignore localStorage errors
  }
};

// Get saved step
export const getSavedStep = (): number => {
  try {
    const saved = localStorage.getItem(WALKTHROUGH_STEP_KEY);
    return saved ? parseInt(saved, 10) : 0;
  } catch {
    return 0;
  }
};
