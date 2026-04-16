export type SubscriptionStatus = 'trial' | 'active' | 'trial_expired' | 'grace' | 'locked';

export interface OrganizationBilling {
  id: string;
  name: string;
  subscription_status: SubscriptionStatus;
  declared_seat_count: number;
  trial_ends_at: string | null;
  current_subscription_ends_at: string | null;
  billing_enabled: boolean;
}
