
import { useState } from "react";
import { Bell, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead } from "@/hooks/useNotifications";
import { Notification } from "@/types/notifications";

const getNotificationTypeColor = (type: Notification['type']) => {
  switch (type) {
    case 'system': return 'bg-blue-500';
    case 'activity': return 'bg-green-500';
    case 'alert': return 'bg-red-500';
    case 'info': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

export function NotificationDropdown() {
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  
  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No notifications yet
            </div>
          ) : (
            recentNotifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <Circle className={`w-2 h-2 mt-2 ${getNotificationTypeColor(notification.type)} rounded-full`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${notification.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {recentNotifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
              View All Notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
