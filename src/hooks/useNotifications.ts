import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notifications";

const DISABLE_AUTH = import.meta.env.VITE_DISABLE_AUTH === "true";

/**
 * Fetch notifications with graceful bypass when auth is disabled.
 * - In bypass mode, returns an empty list immediately and performs no network calls.
 * - In normal mode, queries the database and bubbles errors to React Query.
 */
export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (DISABLE_AUTH) {
        // Auth bypass: return safe fallback without hitting the network
        return [];
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Notification[];
    },
    // Keep queries conservative to reduce noise; UI can refetch on demand
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch unread notifications count with bypass support.
 * - In bypass mode, returns 0 immediately and performs no network calls.
 */
export const useUnreadNotificationsCount = () => {
  return useQuery<number>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      if (DISABLE_AUTH) {
        return 0;
      }

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Mark a notification as read, no-op in bypass mode.
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (DISABLE_AUTH) {
        // No-op in bypass mode, but resolve successfully to keep UX smooth
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};
