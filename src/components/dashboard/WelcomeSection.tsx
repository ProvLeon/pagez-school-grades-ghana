import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, CalendarDays, BookOpen } from "lucide-react";
import { format } from "date-fns";

export function WelcomeSection() {
  const { user, userProfile } = useAuth();

  const getUserDisplayName = () => {
    if (userProfile?.full_name) return userProfile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  };

  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="mb-2">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Welcome back, <span className="uppercase">{getUserDisplayName()}</span>!
      </h2>
      <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-muted-foreground">
        Here's a summary of your school's activities.
      </p>
    </div>
  );
}
