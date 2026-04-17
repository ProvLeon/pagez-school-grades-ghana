import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, ArrowRight, Check, Shield, Zap, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthPanelDecoration from "@/components/auth/AuthPanelDecoration";

interface SignUpFormData {
  fullName: string;
  schoolName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

const SignUp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    schoolName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = "School name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }
    else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^(\+233|0)\d{9}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Enter a valid Ghana number (e.g., 0201234567)";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const formatPhoneAsEmail = (phone: string): string => {
    const cleanPhone = phone.replace(/\s/g, "").replace("+", "");
    return `${cleanPhone}@eresults.gh`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const email = formData.email.trim();

      const { data, error } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            school_name: formData.schoolName.trim(),
            phone_number: formData.phoneNumber.replace(/\s/g, ""),
            email: formData.email.trim() || null,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const { data: newOrg, error: orgError } = await supabase
          .from("organizations")
          .insert({
            name: formData.schoolName.trim(),
            school_name: formData.schoolName.trim(),
            admin_id: data.user.id,
          })
          .select("id")
          .single();

        if (orgError) {
          console.error("Error creating organization:", orgError);
        }

        const organizationId = newOrg?.id;

        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: data.user.id,
            user_type: "admin",
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }

        if (organizationId) {
          const { error: orgProfileError } = await (supabase as any)
            .from("user_organization_profiles")
            .insert({
              user_id: data.user.id,
              organization_id: organizationId,
              role: "admin",
              is_active: true,
            });

          if (orgProfileError) {
            console.error("Error linking user to organization:", orgProfileError);
          }
        }

        const { error: settingsError } = await (supabase as any)
          .from("school_settings")
          .insert({
            school_name: formData.schoolName.trim(),
            admin_id: data.user.id,
            organization_id: organizationId,
          });

        if (settingsError) {
          console.error("Error creating school settings:", settingsError);
        }

        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.warn("Error signing out after signup:", signOutError);
        }

        setIsSubmitted(true);
        toast({
          title: "Account Created",
          description: "Your account has been created successfully!",
        });
      }
    } catch (err: any) {
      console.error("Sign up error:", err);

      let errorMessage = "Failed to create account. Please try again.";
      
      // Handle the new Supabase error signatures for duplicates
      if (
        err.message?.toLowerCase().includes("already registered") || 
        err.message?.toLowerCase().includes("user already exists") ||
        err.status === 422 || 
        err.code === "user_already_exists"
      ) {
        errorMessage = "An account with this email or phone number already exists.";
      }

      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Success Screen ──────────────────────────────────────────────────── */
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Animated success icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" style={{ animationDuration: '2s' }} />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-500/25">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome to e-Results GH!
            </h1>
            <p className="text-gray-500 text-base max-w-xs mx-auto">
              Your school account has been created successfully.
            </p>
          </div>

          {/* Credentials card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg shadow-gray-200/50 text-left space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Login Credentials</p>
            <div className="space-y-1.5">
              <p className="text-sm text-gray-600">
                Email: <strong className="text-gray-900">{formData.email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Use your email and password to sign in.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold py-4 px-8 rounded-xl text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continue to Login
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-xs text-gray-400">
            e-Results GH | PB Pagez LTD
          </p>
        </div>
      </div>
    );
  }

  /* ── Main Sign Up Screen ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding & Social Proof */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#1d4ed8] overflow-hidden">
        {/* Abstract geometric decoration */}
        <AuthPanelDecoration />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/ERESULTS_LOGO.png" alt="e-Results GH" className="w-10 h-10 rounded-full shadow-lg border-[1px] border-white" />
            <span className="text-white/90 text-lg font-bold tracking-tight">e-Results GH</span>
          </div>

          {/* Hero Text */}
          <div className="space-y-8 my-auto py-16">
            <div className="space-y-5">
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
                Start managing
                <br />
                your school results
                <br />
                <span className="text-blue-200">in minutes.</span>
              </h1>
              <p className="text-blue-200/80 text-lg max-w-sm leading-relaxed">
                Join schools across Ghana using the most advanced grading and reporting engine built for GES standards.
              </p>
            </div>

            {/* Value props */}
            <div className="space-y-4 pt-4">
              {[
                { icon: Zap, text: "Set up your school in under 5 minutes" },
                { icon: Shield, text: "Bank-grade security for all student data" },
                { icon: GraduationCap, text: "BECE & SBA grading built-in" },
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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full bg-white/20 border-2 border-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-blue-200/70 text-xs font-medium ml-1">Trusted by 50+ schools</span>
            </div>
            <p className="text-blue-300/40 text-xs">
              14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-white to-slate-50/80">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img src="/ERESULTS_LOGO.png" alt="e-Results GH" className="w-10 h-10 rounded-full shadow-lg" />
            <span className="text-gray-900 text-lg font-bold tracking-tight">e-Results GH</span>
          </div>

          {/* Header */}
          <div className="space-y-2 mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Create your account
            </h2>
            <p className="text-gray-500 text-base">
              Get started with a free 14-day trial. No credit card needed.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Row: Full Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Mensah"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  disabled={isLoading}
                  className={`h-12 rounded-xl bg-gray-50/80 border-gray-200 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all ${errors.fullName ? "border-red-400 bg-red-50/50" : ""}`}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0201234567"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  required
                  disabled={isLoading}
                  className={`h-12 rounded-xl bg-gray-50/80 border-gray-200 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all ${errors.phoneNumber ? "border-red-400 bg-red-50/50" : ""}`}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Divider — separating personal from organization details */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-150" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-to-br from-white to-slate-50/80 px-3 text-[11px] font-medium text-gray-400 uppercase tracking-widest">School & Account</span>
              </div>
            </div>

            {/* School Name */}
            <div className="space-y-1.5">
              <Label htmlFor="schoolName" className="text-sm font-semibold text-gray-700">
                School Name
              </Label>
              <Input
                id="schoolName"
                type="text"
                placeholder="Kokomlemle 2 Basic School"
                value={formData.schoolName}
                onChange={(e) => handleInputChange("schoolName", e.target.value)}
                required
                disabled={isLoading}
                className={`h-12 rounded-xl bg-gray-50/80 border-gray-200 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all ${errors.schoolName ? "border-red-400 bg-red-50/50" : ""}`}
              />
              {errors.schoolName && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.schoolName}
                </p>
              )}
            </div>

            {/* Email — Login credential */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@school.edu.gh"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={isLoading}
                className={`h-12 rounded-xl bg-gray-50/80 border-gray-200 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all ${errors.email ? "border-red-400 bg-red-50/50" : ""}`}
              />
              <p className="text-xs text-gray-400">You'll use this email to sign in to your account.</p>
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={`h-12 pr-12 rounded-xl bg-gray-50/80 border-gray-200 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all ${errors.password ? "border-red-400 bg-red-50/50" : ""}`}
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
              className="w-full h-13 bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-[#2563EB] hover:underline font-medium">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-[#2563EB] hover:underline font-medium">Privacy Policy</a>.
            </p>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-[#2563EB] hover:underline font-bold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
