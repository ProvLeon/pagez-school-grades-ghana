import { useAuth } from "@/contexts/AuthContext";

export function WelcomeSection() {
  const { user, userProfile } = useAuth();

  const getUserDisplayName = () => {
    if (userProfile?.full_name) return userProfile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">
        Welcome back, {getUserDisplayName()}!
      </h2>
      <p className="text-muted-foreground">
        Here's a summary of your school's activities.
      </p>
    </div>
  );
}
