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
  secondaryTargetSelector?: string; // CSS selector for a secondary element (e.g. sidebar nav item) to show a pulsing ring on simultaneously
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
    title: "Welcome to e-Results GH!",
    description:
      "Let's take a quick tour to help you get familiar with your school management system. This will only take a few minutes.",
    placement: "center",
    category: "welcome",
  },

  // Dashboard — Welcome Banner
  {
    id: "dashboard-welcome",
    title: "Your School at a Glance",
    description:
      "This banner shows your school name, today's date, and a personalised greeting. Use the 'View Analytics' shortcut to jump straight into detailed performance reports.",
    icon: LayoutDashboard,
    targetSelector: '[data-tour="dashboard-welcome"]',
    secondaryTargetSelector: '[data-tour="sidebar-dashboard"]',
    placement: "bottom",
    route: "/dashboard",
    category: "features",
    spotlightPadding: 12,
  },

  // Dashboard — Stats Cards
  {
    id: "dashboard-stats",
    title: "School-Wide Statistics",
    description:
      "These four cards give you a live snapshot — Total Students, Active Classes, registered Teachers, and graded Results. They update automatically as your data changes.",
    icon: LayoutDashboard,
    targetSelector: '[data-tour="dashboard-stats"]',
    secondaryTargetSelector: '[data-tour="sidebar-dashboard"]',
    placement: "bottom",
    route: "/dashboard",
    category: "features",
    spotlightPadding: 16,
  },

  // Dashboard — Performance Charts
  {
    id: "dashboard-performance",
    title: "Performance & Gender Charts",
    description:
      "The left chart shows class performance averages per class. The right chart breaks down your student population by gender. Both update in real time as results are entered.",
    icon: LayoutDashboard,
    targetSelector: '[data-tour="dashboard-performance"]',
    secondaryTargetSelector: '[data-tour="sidebar-dashboard"]',
    placement: "bottom",
    route: "/dashboard",
    category: "features",
    spotlightPadding: 12,
  },

  // Dashboard — Quick Actions
  {
    id: "dashboard-quick-actions",
    title: "Quick Actions",
    description:
      "One-click shortcuts for your most common tasks — Add Student, New Class, Add Results, and Settings. These save you from navigating deep into menus every time.",
    icon: LayoutDashboard,
    targetSelector: '[data-tour="dashboard-quick-actions"]',
    secondaryTargetSelector: '[data-tour="sidebar-dashboard"]',
    placement: "left",
    route: "/dashboard",
    category: "features",
    spotlightPadding: 12,
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
      "Manage all your school classes here. You can create new classes, edit existing ones, and assign students to specific classes. Click 'Classes' in the sidebar to open this section.",
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
      "Organize your curriculum by managing subjects, departments, and subject combinations. Click 'Subjects' in the sidebar to access this section.",
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
      "Add, edit, and manage all student records. You can also import students in bulk using Excel files. Click 'Students' in the sidebar to manage your student records.",
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
      "Record and manage student results. Configure grading settings, add continuous assessment scores, and generate report cards. Click 'Results' in the sidebar to get started.",
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
      "Generate and manage broadsheets, terminal reports, and other academic documents for printing or digital distribution. Click 'Manage Sheets' in the sidebar.",
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
      "Handle student transfers between classes or schools. Keep track of all transfer records and their status. Click 'Manage Transfers' in the sidebar to access this.",
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
      "Add and manage teacher accounts. Assign teachers to classes and subjects, and control their access permissions. Click 'Manage Teachers' in the sidebar.",
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

  // Settings — tab navigation
  {
    id: "settings-nav",
    title: "School Settings",
    description:
      "Settings has three sections — School Information, Branding & Theme, and Billing. Click any tab on the left to switch. You can reach this page anytime via 'Settings' in the sidebar.",
    icon: Settings,
    targetSelector: '[data-tour="settings-nav"]',
    secondaryTargetSelector: '[data-tour="sidebar-settings"]',
    placement: "right",
    route: "/settings",
    category: "settings",
    spotlightPadding: 12,
  },

  // Settings — main content
  {
    id: "settings-content",
    title: "Configure Your School",
    description:
      "Fill in your school's details here and hit Save Settings. A green checkmark on each tab confirms that section is complete. Accessible anytime via 'Settings' in the sidebar.",
    icon: Settings,
    targetSelector: '[data-tour="settings-content"]',
    secondaryTargetSelector: '[data-tour="sidebar-settings"]',
    placement: "left",
    route: "/settings",
    category: "settings",
    spotlightPadding: 12,
  },

  // Profile — Edit Form
  {
    id: "profile-form",
    title: "Your Profile",
    description:
      "Update your full name, email address, phone number, and password here. Changes take effect immediately after saving. Reach this page anytime via 'My Profile' in the sidebar.",
    icon: User,
    targetSelector: '[data-tour="profile-form"]',
    secondaryTargetSelector: '[data-tour="sidebar-profile"]',
    placement: "top",
    route: "/profile",
    category: "settings",
    spotlightPadding: 12,
  },

  // Settings — Restart Tour button
  {
    id: "profile-restart-tour",
    title: "Restart This Tour Anytime",
    description:
      "The 'Restart Tour' button lives here in the Settings sidebar. Use it anytime you need a refresher — great for onboarding new staff. Access Settings via the sidebar.",
    icon: Settings,
    targetSelector: '[data-tour="settings-restart-tour"]',
    secondaryTargetSelector: '[data-tour="sidebar-settings"]',
    placement: "right",
    route: "/settings",
    category: "settings",
    spotlightPadding: 12,
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

// Total step count (used externally)
export const TOTAL_WALKTHROUGH_STEPS = walkthroughSteps.length;

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
        step.id === "dashboard-welcome" ||
        step.id === "dashboard-stats" ||
        step.id === "sidebar-navigation" ||
        step.id === "results-section" ||
        step.id === "header-actions" ||
        step.id === "theme-toggle" ||
        step.id === "profile-form" ||
        step.id === "profile-restart-tour"
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
