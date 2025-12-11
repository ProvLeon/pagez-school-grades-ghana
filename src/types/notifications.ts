
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  type: 'system' | 'activity' | 'alert' | 'info';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}
