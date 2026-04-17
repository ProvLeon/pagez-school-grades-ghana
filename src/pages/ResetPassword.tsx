import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, ArrowRight, Shield, BarChart3, FileText, CheckCircle, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingComp from "@/components/ui/loading";
import AuthPanelDecoration from "@/components/auth/AuthPanelDecoration";

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

  if (isValidRecovery === null) {
    return <LoadingComp message="Verifying Link" subtext="Checking the validity of your reset link..." />;
  }

  const renderContent = () => {
    if (isValidRecovery === false) {
      return (
        <div className="w-full max-w-[440px] text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Invalid Link</h2>
            <p className="text-gray-500 text-base">
              {errorMessage || "This password reset link is invalid or has expired."}
            </p>
          </div>
          <div className="space-y-3 pt-4">
            <button 
              onClick={() => navigate("/forgot-password")}
              className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold py-4 rounded-xl text-base shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              Request New Link
            </button>
            <button 
              onClick={() => navigate("/login")}
              className="w-full bg-white hover:bg-gray-50 text-[#2563EB] font-bold py-4 rounded-xl text-base transition-all duration-200 border border-gray-200"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className="w-full max-w-[440px] text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Success!</h2>
            <p className="text-gray-500 text-base">
              Your password has been successfully updated. You will be redirected to the sign in page shortly.
            </p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => navigate("/login")}
              className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold py-4 rounded-xl text-base shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Go to Sign In
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-[440px]">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <img src="/ERESULTS_LOGO.png" alt="e-Results GH" className="w-10 h-10 rounded-full border-white border-[1px] shadow-lg" />
          <span className="text-gray-900 text-lg font-bold tracking-tight">e-Results GH</span>
        </div>

        {/* Header */}
        <div className="space-y-2 mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Create new password
          </h2>
          <p className="text-gray-500 text-base">
            Your new password must be uniquely different from your previously used passwords.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
              New Password
            </Label>
            <div className="relative">
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
                className={`h-12 pr-12 rounded-xl bg-gray-50/80 border-gray-200 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all ${errors.password ? 'border-red-400 bg-red-50/50' : ''}`}
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
              Confirm Password
            </Label>
            <div className="relative">
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
                className={`h-12 pr-12 rounded-xl bg-gray-50/80 border-gray-200 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all ${errors.confirmPassword ? 'border-red-400 bg-red-50/50' : ''}`}
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                Reset Password
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Remembered your password?{" "}
            <Link to="/login" className="text-[#2563EB] hover:underline font-bold transition-colors">
              Sign In
            </Link>
          </p>
          <p className="text-xs text-gray-400 mt-4">
            e-Results GH v {import.meta.env.VITE_APP_VERSION} | PB Pagez LTD
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#1d4ed8] overflow-hidden">
        {/* Abstract geometric decoration */}
        <AuthPanelDecoration />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/ERESULTS_LOGO.png" alt="e-Results GH" className="w-10 h-10 rounded-full border-white border-[1px] shadow-lg" />
            <span className="text-white/90 text-lg font-bold tracking-tight">e-Results GH</span>
          </div>

          {/* Hero Text */}
          <div className="space-y-8 my-auto py-16">
            <div className="space-y-5">
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
                Secure your
                <br />
                account
                <br />
                <span className="text-blue-200">swiftly.</span>
              </h1>
              <p className="text-blue-200/80 text-lg max-w-sm leading-relaxed">
                Update your credentials to maintain secure access to your academic dashboard.
              </p>
            </div>

            {/* Key highlights */}
            <div className="space-y-4 pt-4">
              {[
                { icon: Shield, text: "End-to-end data encryption" },
                { icon: KeyRound, text: "Strict role-based access" },
                { icon: FileText, text: "Secure record management" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-200" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-blue-300/40 text-xs">
            Trusted by schools across Ghana. Built by PB Pagez LTD.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-white to-slate-50/80">
        {renderContent()}
      </div>
    </div>
  );
};

export default ResetPassword;
