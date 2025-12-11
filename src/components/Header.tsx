
import { Bell, User, Moon, Sun, LogOut, ChevronDown, Home, HelpCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { generateBreadcrumbs } from "@/utils/breadcrumbs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useWalkthrough } from "@/contexts/WalkthroughContext";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumbs = generateBreadcrumbs(location.pathname);
  const { signOut, user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { restartWalkthrough, isActive: isWalkthroughActive } = useWalkthrough();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b px-4 lg:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-2 p-2 hover:bg-muted rounded-full" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3" data-tour="header-actions">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={toggleDarkMode}
            data-tour="theme-toggle"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <div data-tour="notifications">
            <NotificationDropdown />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 rounded-full p-1 h-auto" data-tour="user-menu">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  {user?.email ? (
                    <span className="rounded-full w-7 h-7 p-0">
                      <p className="text-primary text-lg center">
                        {"Emma".split("", 1)}
                      </p>
                    </span>
                  ) : <User className="w-5 h-5 text-primary" />}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={restartWalkthrough}
                disabled={isWalkthroughActive}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                <span>Platform Tour</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-2 md:hidden">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </header>
  );
}
