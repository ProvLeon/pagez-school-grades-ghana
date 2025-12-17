import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  ClipboardList,
  ArrowLeftRight,
  UserCheck,
  Settings,
  ChevronDown,
  Building2,
  User,
  LucideIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Define user roles
type UserRole = 'admin' | 'super_admin' | 'teacher';

// Menu item interface with role-based visibility
interface SubMenuItem {
  title: string;
  url: string;
  roles?: UserRole[]; // If not specified, inherits from parent or visible to all
}

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  tourId: string;
  roles?: UserRole[]; // If not specified, visible to all authenticated users
  subItems?: SubMenuItem[];
}

// Unified menu structure with role-based visibility
// roles: undefined or [] = visible to all
// roles: ['admin', 'super_admin'] = visible only to admins
// roles: ['teacher'] = visible only to teachers
const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    tourId: "sidebar-dashboard"
    // All roles can see dashboard
  },
  {
    title: "Classes",
    url: "/classes",
    icon: GraduationCap,
    tourId: "sidebar-classes",
    roles: ['admin', 'super_admin']
  },
  {
    title: "Subjects",
    url: "/subjects",
    icon: BookOpen,
    tourId: "sidebar-subjects",
    roles: ['admin', 'super_admin'],
    subItems: [
      { title: "Manage Subjects", url: "/subjects/manage-subjects" },
      { title: "Departments", url: "/subjects/manage-departments" },
      { title: "Subject Combinations", url: "/subjects/manage-combinations" }
    ]
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
    tourId: "sidebar-students",
    roles: ['admin', 'super_admin', 'teacher'],
    subItems: [
      { title: "Add Students", url: "/students/add-students", roles: ['admin', 'super_admin'] },
      { title: "Manage Students", url: "/students/manage-students" }
    ]
  },
  {
    title: "Results",
    url: "/results",
    icon: FileText,
    tourId: "sidebar-results",
    // All roles can access results - content is filtered by role in the components
    subItems: [
      { title: "Add Results", url: "/results/add-results" },
      { title: "Manage Results", url: "/results/manage-results" },
      { title: "Grading Settings", url: "/results/grading-settings", roles: ['admin', 'super_admin'] }
    ]
  },
  {
    title: "Mock Exams",
    url: "/mock-exams",
    icon: FileText,
    tourId: "sidebar-mock",
    roles: ['admin', 'super_admin']
  },
  {
    title: "Manage Sheets",
    url: "/manage-sheets",
    icon: ClipboardList,
    tourId: "sidebar-sheets",
    roles: ['admin', 'super_admin']
  },
  {
    title: "Manage Transfers",
    url: "/manage-transfers",
    icon: ArrowLeftRight,
    tourId: "sidebar-transfers",
    roles: ['admin', 'super_admin']
  },
  {
    title: "Manage Teachers",
    url: "/manage-teacher",
    icon: UserCheck,
    tourId: "sidebar-teachers",
    roles: ['admin', 'super_admin']
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    tourId: "sidebar-settings",
    roles: ['admin', 'super_admin']
  },
  {
    title: "My Profile",
    url: "/profile",
    icon: User,
    tourId: "sidebar-profile"
    // All roles can see their profile
  },
];

// Helper to check if user has access to a menu item
function hasAccess(itemRoles: UserRole[] | undefined, userRole: UserRole): boolean {
  // If no roles specified, everyone can access
  if (!itemRoles || itemRoles.length === 0) return true;
  // Check if user's role is in the allowed roles
  return itemRoles.includes(userRole);
}

export function AppSidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [logoError, setLogoError] = useState(false);
  const [schoolName, setSchoolName] = useState("GES SBA System");
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const { userProfile, isTeacher, isAdmin } = useAuth();

  // Determine user's role
  const userRole: UserRole = useMemo(() => {
    const profileType = userProfile?.user_type as string | undefined;
    if (profileType === 'super_admin') return 'super_admin';
    if (profileType === 'admin' || isAdmin) return 'admin';
    if (profileType === 'teacher' || isTeacher) return 'teacher';
    return 'teacher'; // Default to most restrictive
  }, [userProfile, isTeacher, isAdmin]);

  // Filter menu items based on user's role
  const visibleMenuItems = useMemo(() => {
    return menuItems
      .filter(item => hasAccess(item.roles, userRole))
      .map(item => ({
        ...item,
        // Also filter sub-items based on role
        subItems: item.subItems?.filter(sub => hasAccess(sub.roles, userRole))
      }));
  }, [userRole]);

  // Fetch school settings for name and logo
  useEffect(() => {
    const fetchSchoolSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('school_settings')
          .select('school_name, logo_url')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching school settings:', error);
          return;
        }

        if (data) {
          if (data.school_name) {
            setSchoolName(data.school_name);
          }
          if (data.logo_url) {
            setSchoolLogo(data.logo_url);
            setLogoError(false);
          }
        }
      } catch (error) {
        console.error('Error fetching school settings:', error);
      }
    };

    fetchSchoolSettings();

    // Subscribe to changes in school_settings
    const channel = supabase
      .channel('school_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'school_settings'
        },
        (payload: { new: { school_name?: string; logo_url?: string } | null }) => {
          if (payload.new) {
            if (payload.new.school_name) {
              setSchoolName(payload.new.school_name);
            }
            if (payload.new.logo_url) {
              setSchoolLogo(payload.new.logo_url);
              setLogoError(false);
            } else {
              setSchoolLogo(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems(prev =>
      prev.includes(itemTitle)
        ? prev.filter(item => item !== itemTitle)
        : [...prev, itemTitle]
    );
  };

  const isActive = (url: string, exact = false) => {
    return exact ? location.pathname === url : location.pathname.startsWith(url);
  };

  // Get role display name for badge
  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'teacher': return 'Teacher';
      default: return 'User';
    }
  };

  // Get role badge color
  const getRoleBadgeVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (userRole) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'teacher': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Sidebar className="bg-card border-r" data-tour="sidebar">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-primary/10 text-primary">
            {logoError || !schoolLogo ? (
              <Building2 className="w-6 h-6" />
            ) : (
              <img
                src={schoolLogo}
                alt={`${schoolName} Logo`}
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base text-foreground line-clamp-1" title={schoolName}>
              {schoolName}
            </h2>
            <Badge variant={getRoleBadgeVariant()} className="text-xs px-1.5 py-0 mt-0.5">
              {getRoleDisplayName()}
            </Badge>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {visibleMenuItems.map((item) => (
            <SidebarMenuItem key={item.title} data-tour={item.tourId}>
              {item.subItems && item.subItems.length > 0 ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(item.url) ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    data-tour={item.tourId}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", expandedItems.includes(item.title) && "rotate-180")} />
                  </button>
                  {expandedItems.includes(item.title) && (
                    <div className="ml-4 mt-1 pl-4 border-l border-border space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.title}
                          to={subItem.url}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive(subItem.url, true) ? "text-primary bg-muted" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.url, true) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-tour={item.tourId}
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </Link>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} {schoolName}. v1.2.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
