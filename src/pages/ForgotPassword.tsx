import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, AlertCircle, ArrowLeft, ArrowRight, Shield, KeyRound, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthPanelDecoration from "@/components/auth/AuthPanelDecoration";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setIsSubmitted(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isSubmitted) {
      return (
        <div className="w-full max-w-[440px] text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Check Your Email</h2>
            <p className="text-gray-500 text-base">
              We've sent a password reset link to <strong className="text-gray-900">{email}</strong>
            </p>
          </div>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Click the link in the email to reset your password. If you don't see the email, check your spam folder.
          </p>
          <div className="space-y-3 pt-4">
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-white hover:bg-gray-50 text-[#2563EB] font-bold py-4 rounded-xl text-base transition-all duration-200 border border-gray-200"
            >
              Try another email
            </button>
            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="text-sm text-[#2563EB] hover:underline font-bold inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
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
            Forgot Password?
          </h2>
          <p className="text-gray-500 text-base">
            No worries, we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="admin@school.edu.gh"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                required
                disabled={isLoading}
                className={`h-12 pl-12 rounded-xl bg-gray-50/80 border-gray-200 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all ${error ? 'border-red-400 bg-red-50/50' : ''}`}
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link
            to="/login"
            className="text-sm text-[#2563EB] hover:underline font-bold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
          <p className="text-xs text-gray-400 mt-6">
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
                Lost your key?
                <br />
                We'll forge
                <br />
                <span className="text-blue-200">a new one.</span>
              </h1>
              <p className="text-blue-200/80 text-lg max-w-sm leading-relaxed">
                Regain access to your secure workspace without losing any of your data.
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

export default ForgotPassword;
