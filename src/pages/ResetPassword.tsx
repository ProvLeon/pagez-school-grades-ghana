import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidRecovery, setIsValidRecovery] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for error parameters in URL (Supabase redirects with these when link expires)
    const urlError = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    // Also check hash for errors (Supabase sometimes puts errors there)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashError = hashParams.get('error');
    const hashErrorCode = hashParams.get('error_code');
    const hashErrorDescription = hashParams.get('error_description');

    const finalError = urlError || hashError;
    const finalErrorCode = errorCode || hashErrorCode;
    const finalErrorDescription = errorDescription || hashErrorDescription;

    if (finalError || finalErrorCode) {
      // Link has expired or is invalid
      if (finalErrorCode === 'otp_expired') {
        setErrorMessage("This password reset link has expired. Please request a new one.");
      } else if (finalErrorDescription) {
        setErrorMessage(decodeURIComponent(finalErrorDescription.replace(/\+/g, ' ')));
      } else {
        setErrorMessage("This password reset link is invalid or has expired.");
      }
      setIsValidRecovery(false);
      return;
    }

    // Set up auth state listener - Supabase client automatically handles code exchange
    // via detectSessionInUrl: true, so we just need to listen for the events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session ? 'has session' : 'no session');

      if (event === 'PASSWORD_RECOVERY') {
        // This is the primary event we're looking for
        setIsValidRecovery(true);
      } else if (event === 'SIGNED_IN' && session) {
        // With PKCE, recovery often comes as SIGNED_IN after automatic code exchange
        // If we have a session after coming from a reset link, allow password reset
        setIsValidRecovery(true);
      } else if (event === 'INITIAL_SESSION' && session) {
        // Session was already established (code was already exchanged)
        setIsValidRecovery(true);
      }
    });

    // Check for existing session (user might have already been authenticated via the link)
    const checkExistingSession = async () => {
      // Small delay to let Supabase client process the URL and exchange code automatically
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Has a valid session - allow password reset
        setIsValidRecovery(true);
        return;
      }

      // No session yet - wait a bit more for auth state change, then mark as invalid
      setTimeout(() => {
        setIsValidRecovery((current) => {
          if (current === null) {
            return false;
          }
          return current;
        });
      }, 2000);
    };

    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Password Updated",
        description: "Your password has been successfully reset.",
      });

      // Sign out the user so they can log in fresh with new password
      await supabase.auth.signOut();

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      const message = err instanceof Error ? err.message : "Failed to reset password. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking for recovery session
  if (isValidRecovery === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired recovery link
  if (isValidRecovery === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Invalid or Expired Link
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              {errorMessage || "This password reset link is invalid or has expired."}
            </p>
          </CardHeader>

          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Please request a new password reset link to continue.
              </p>

              <Button
                className="w-full"
                onClick={() => navigate("/forgot-password")}
              >
                Request New Link
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="text-sm text-primary"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Password Reset Successful
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Your password has been successfully updated.
            </p>
          </CardHeader>

          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                You will be redirected to the login page shortly. You can now sign in with your new password.
              </p>

              <Button
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
            Reset Password
          </CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Enter your new password below
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                  }}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={`pl-10 pr-12 h-12 ${errors.password ? 'border-destructive' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
                  }}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={`pl-10 pr-12 h-12 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-semibold shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground mt-4">
              e-Results GH v 1.0.0 | PB Pagez LTD
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
