
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Activity, ShieldAlert, Info, CheckCircle } from "lucide-react";
import { Notification } from "@/types/notifications";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  notifications: Notification[];
}

const notificationIcons: Record<Notification['type'], React.ElementType> = {
  system: Info,
  activity: CheckCircle,
  alert: ShieldAlert,
  info: Info,
};

const notificationColors: Record<Notification['type'], string> = {
  system: "text-blue-500",
  activity: "text-green-500",
  alert: "text-red-500",
  info: "text-gray-500",
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

export const RecentActivity = ({ notifications }: RecentActivityProps) => {
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-card-foreground">Recent Activity</h3>
        </div>
      </div>
      
      <div className="space-y-4">
        {recentNotifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 flex flex-col items-center">
            <div className="rounded-full bg-slate-50 dark:bg-muted p-4 mb-3">
              <Activity className="w-8 h-8 text-slate-300 dark:text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="relative before:absolute before:inset-0 before:left-[17px] before:w-[2px] before:bg-slate-100 dark:before:bg-border">
            {recentNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || Info;
              const color = notificationColors[notification.type] || "text-slate-500";
              const bgOpacityType = notification.type === 'alert' ? 'bg-red-50 dark:bg-red-500/10' : notification.type === 'system' ? 'bg-blue-50 dark:bg-blue-500/10' : notification.type === 'activity' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-muted';
              
              return (
                <div key={notification.id} className="relative z-10 mb-4 flex items-start gap-4 last:mb-0">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white dark:border-background shadow-sm ring-1 ring-slate-100 dark:ring-border", bgOpacityType, color)}>
                    <Icon className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-card-foreground">{notification.title}</p>
                    <p className="text-xs font-medium text-slate-400 dark:text-muted-foreground mt-0.5">{formatTimeAgo(notification.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
