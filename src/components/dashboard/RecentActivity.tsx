
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentNotifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            recentNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || Info;
              const color = notificationColors[notification.type] || "text-gray-500";
              return (
                <div key={notification.id} className="flex items-start gap-3">
                  <div className={cn("mt-1", color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(notification.created_at)}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
