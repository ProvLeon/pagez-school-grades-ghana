import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
  Building2
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

const adminMenuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, tourId: "sidebar-dashboard" },
  { title: "Classes", url: "/classes", icon: GraduationCap, tourId: "sidebar-classes" },
  {
    title: "Subjects",
    url: "/subjects",
    icon: BookOpen,
    tourId: "sidebar-subjects",
    subItems: [
      { title: "Manage Subjects", url: "/subjects/manage-subjects" },
      { title: "Student Department", url: "/subjects/manage-departments" },
      { title: "Subject Combination", url: "/subjects/manage-combinations" }
    ]
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
    tourId: "sidebar-students",
    subItems: [
      { title: "Add Students", url: "/students/add-students" },
      { title: "Manage Students", url: "/students/manage-students" }
    ]
  },
  {
    title: "Results",
    url: "/results",
    icon: FileText,
    tourId: "sidebar-results",
    subItems: [
      { title: "Add Results", url: "/results/add-results" },
      { title: "Manage Results", url: "/results/manage-results" },
      { title: "Grading Settings", url: "/results/grading-settings" }
    ]
  },
  { title: "Mock Exams", url: "/mock-exams", icon: FileText, tourId: "sidebar-mock" },
  { title: "Manage Sheets", url: "/manage-sheets", icon: ClipboardList, tourId: "sidebar-sheets" },
  { title: "Manage Transfers", url: "/manage-transfers", icon: ArrowLeftRight, tourId: "sidebar-transfers" },
  { title: "Manage Teacher", url: "/manage-teacher", icon: UserCheck, tourId: "sidebar-teachers" },
  { title: "Settings", url: "/settings", icon: Settings, tourId: "sidebar-settings" },
];

const teacherMenuItems = [
  { title: "Dashboard", url: "/teacher/dashboard", icon: LayoutDashboard, tourId: "sidebar-dashboard" },
  {
    title: "My Results",
    url: "/teacher/results",
    icon: FileText,
    tourId: "sidebar-results",
    subItems: [
      { title: "Add Results", url: "/teacher/results/add" },
      { title: "Manage Results", url: "/teacher/results/manage" }
    ]
  },
  { title: "My Profile", url: "/manage-profile", icon: UserCheck, tourId: "sidebar-profile" },
];

export function AppSidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [logoError, setLogoError] = useState(false);
  const [schoolName, setSchoolName] = useState("GES SBA System");
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const { isTeacher } = useAuth();

  const menuItems = isTeacher ? teacherMenuItems : adminMenuItems;

  // Fetch school settings for name and logo
  useEffect(() => {
    const fetchSchoolSettings = async () => {
      try {
        const { data, error } = await (supabase as any)
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
        (payload: any) => {
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
          <div>
            <h2 className="font-semibold text-base text-foreground line-clamp-1" title={schoolName}>
              {schoolName}
            </h2>
            <p className="text-xs text-muted-foreground">School Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title} data-tour={item.tourId}>
              {item.subItems ? (
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
