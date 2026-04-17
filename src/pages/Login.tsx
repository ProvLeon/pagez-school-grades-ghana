import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, ArrowRight, Shield, BarChart3, FileText } from "lucide-react";
import { authService, LoginCredentials } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";

const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── Loading State ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50">
        <div className="text-center space-y-6">
          {/* Logo with circular pulse */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-2 border-blue-400/30 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin" style={{ animationDuration: '1.5s' }} />
            </div>
            <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-xl ring-4 ring-white z-10">
              <img src="/ERESULTS_LOGO.png" alt="e-Results GH" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Loading
              <span className="inline-flex ml-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  /* ── Validation ──────────────────────────────────────────────────────── */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await authService.signIn(formData);

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back to e-Results GH!",
          variant: "default",
        });
      } else {
        toast({
          title: "Login Failed",
          description: result.error?.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "System Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#1d4ed8] overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/ERESULTS_LOGO.png" alt="e-Results GH" className="w-10 h-10 rounded-xl shadow-lg" />
            <span className="text-white/90 text-lg font-bold tracking-tight">e-Results GH</span>
          </div>

          {/* Hero Text */}
          <div className="space-y-8 my-auto py-16">
            <div className="space-y-5">
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
                Welcome back
                <br />
                to your
                <br />
                <span className="text-blue-200">academic hub.</span>
              </h1>
              <p className="text-blue-200/80 text-lg max-w-sm leading-relaxed">
                Pick up right where you left off. Your results, reports, and analytics are waiting.
              </p>
            </div>

            {/* Key highlights */}
            <div className="space-y-4 pt-4">
              {[
                { icon: FileText, text: "Instant report sheet generation" },
                { icon: Shield, text: "Your data is always secure" },
                { icon: BarChart3, text: "Real-time performance analytics" },
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

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-white to-slate-50/80">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img src="/ERESULTS_LOGO.png" alt="e-Results GH" className="w-10 h-10 rounded-xl shadow-lg" />
            <span className="text-gray-900 text-lg font-bold tracking-tight">e-Results GH</span>
          </div>

          {/* Header */}
          <div className="space-y-2 mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Sign in
            </h2>
            <p className="text-gray-500 text-base">
              Access your academic dashboard securely.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@school.edu.gh"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={isLoading}
                className={`h-12 rounded-xl bg-gray-50/80 border-gray-200 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all ${errors.email ? 'border-red-400 bg-red-50/50' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <a href="/forgot-password" className="text-xs text-[#2563EB] hover:underline font-semibold transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  disabled={isLoading}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#2563EB] hover:underline font-bold transition-colors">
                Sign Up
              </Link>
            </p>
            <p className="text-xs text-gray-400 mt-4">
              e-Results GH v {import.meta.env.VITE_APP_VERSION} | PB Pagez LTD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
