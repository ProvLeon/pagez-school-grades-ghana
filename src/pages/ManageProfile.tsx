
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Info, CheckCircle2, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import { WalkthroughTrigger } from "@/components/walkthrough";
import { supabase } from "@/lib/supabase";

// Generate a username from name + 3 random digits
const generateUsername = (name: string): string => {
  // Clean the name: lowercase, remove spaces and special characters
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  // Generate 3 random digits
  const randomDigits = Math.floor(100 + Math.random() * 900).toString();
  return `${cleanName}${randomDigits}`;
};

const ManageProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [showGuides, setShowGuides] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Check if username needs to be generated
  const needsUsernameGeneration = (): boolean => {
    const existingUsername = user?.user_metadata?.username;
    // Needs generation if no username or if it's the old dummy format
    return !existingUsername || existingUsername.match(/^[a-z]+\d{10,}$/);
  };

  // Get existing username or generate one from the user's name
  const getInitialUsername = (): string => {
    const existingUsername = user?.user_metadata?.username;

    // Check if username exists and is NOT the old dummy format
    // Old format was like "kokomlemlebasic1378303665" - very long with many digits
    if (existingUsername && !existingUsername.match(/^[a-z]+\d{10,}$/)) {
      return existingUsername;
    }

    // Generate from full_name or email prefix
    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'user';
    return generateUsername(name);
  };

  const [usernameWasGenerated, setUsernameWasGenerated] = useState(needsUsernameGeneration());

  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    username: getInitialUsername(),
    newPassword: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-save username if it was newly generated
  useEffect(() => {
    const saveGeneratedUsername = async () => {
      if (usernameWasGenerated && user && formData.username) {
        try {
          console.log("Auto-saving generated username:", formData.username);
          const { error } = await supabase.auth.updateUser({
            data: {
              username: formData.username,
            },
          });

          if (error) {
            console.error("Failed to auto-save username:", error);
          } else {
            console.log("Username auto-saved successfully");
            setUsernameWasGenerated(false); // Don't save again
            if (refreshUser) {
              await refreshUser();
            }
          }
        } catch (err) {
          console.error("Error auto-saving username:", err);
        }
      }
    };

    saveGeneratedUsername();
  }, [usernameWasGenerated, user, formData.username, refreshUser]);

  const handleSaveProfile = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    console.log("Saving profile:", formData);

    try {
      // Update user metadata in Supabase Auth
      const updates: { email?: string; password?: string; data?: Record<string, string> } = {
        data: {
          full_name: formData.fullName,
          username: formData.username,
        },
      };

      // Only update email if it changed
      if (formData.email !== user.email) {
        updates.email = formData.email;
      }

      // Only update password if provided
      if (formData.newPassword && formData.newPassword.trim() !== "") {
        updates.password = formData.newPassword;
      }

      const { error: authError } = await supabase.auth.updateUser(updates);

      if (authError) {
        console.error("Auth update error:", authError);
        throw authError;
      }

      // Note: The profiles table only has id, user_id, user_type, created_at, updated_at
      // Full name, email, and username are stored in Supabase Auth user_metadata (updated above)
      // We only update the updated_at timestamp in the profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (profileError) {
        // Profile table might not exist, log but don't fail
        console.warn("Profile table update warning:", profileError);
      }

      // Refresh the user data in context
      if (refreshUser) {
        await refreshUser();
      }

      // Clear password field after successful save
      setFormData(prev => ({ ...prev, newPassword: "" }));

      toast({
        title: "Profile Updated",
        description: formData.email !== user.email
          ? "Your profile has been saved. Please check your email to confirm the new email address."
          : "Your profile has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="hover:bg-accent transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Manage Profile
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your personal information and account settings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGuides(!showGuides)}
                className="gap-2 hover:bg-accent transition-colors"
              >
                {showGuides ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showGuides ? "Hide" : "Show"} Guides
              </Button>
            </div>
          </div>

          {/* Guides Section */}
          {showGuides && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-3 flex-1">
                    <h3 className="font-semibold text-sm text-foreground">Profile Management Guide</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div className="space-y-1.5">
                        <p className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>Personal Information:</strong> Keep your full name and contact details current</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>Email Updates:</strong> Ensure your email is valid for notifications</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>Password Security:</strong> Use strong passwords and change regularly</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>Account Settings:</strong> Review and update your preferences</span>
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <span><strong>Do Not:</strong> Share your password or account credentials</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <span><strong>Avoid:</strong> Using personal information in passwords</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                          <span><strong>Privacy:</strong> Be cautious with information you share</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                          <span><strong>Best Practice:</strong> Regularly update your profile information</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="border-border/50 shadow-sm mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-primary">{formData.fullName.charAt(0)}</span>
                </div>
                <h1 className="text-2xl font-bold">{formData.fullName}</h1>
                <p className="text-muted-foreground">{formData.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
              <p className="text-muted-foreground">Update your personal information</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Username (Display Only)</label>
                  <Input
                    value={formData.username}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is your display identifier. Login uses your email address.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    New Password (Leave blank if you don't want to change)
                  </label>
                  <Input
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  onClick={handleSaveProfile}
                  className="px-8 py-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Platform Tour Section */}
          <div className="mt-6">
            <WalkthroughTrigger variant="card" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageProfile;
