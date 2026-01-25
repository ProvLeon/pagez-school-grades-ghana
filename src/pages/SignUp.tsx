import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Building2, Phone, Lock, AlertCircle, UserPlus, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SignUpFormData {
  fullName: string;
  schoolName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
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
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      newErrors.phoneNumber = "Please enter a valid Ghana phone number (e.g., 0201234567 or +233201234567)";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
    // Remove spaces and format phone for use as email identifier
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
      // Use provided email or generate one from phone number for Supabase auth
      const email = formData.email.trim() || formatPhoneAsEmail(formData.phoneNumber);

      // Sign up with Supabase
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
        // Create profile with admin role for new school owner
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: data.user.id,
            user_type: "admin",
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Don't fail the signup for this, but log it
        }

        // Create school_settings entry for the new school
        const { error: settingsError } = await supabase
          .from("school_settings")
          .insert({
            school_name: formData.schoolName.trim(),
            admin_id: data.user.id,
          });

        if (settingsError) {
          console.error("Error creating school settings:", settingsError);
          // Don't fail the signup for this, we can set it up later
        }

        // Sign out the user immediately after signup
        // Supabase auto-authenticates during signup, but we want users to explicitly login
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.warn("Error signing out after signup:", signOutError);
          // Continue anyway, the signup was successful
        }

        setIsSubmitted(true);
        toast({
          title: "Account Created",
          description: "Your account has been created successfully!",
        });
      }
    } catch (err: unknown) {
      console.error("Sign up error:", err);

      let errorMessage = "Failed to create account. Please try again.";
      const errorObj = err as { message?: string };
      if (errorObj.message?.includes("already registered")) {
        errorMessage = "An account with this phone number already exists.";
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

  if (isSubmitted) {
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
              Welcome to e-Results GH!
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Your account has been created successfully.
            </p>
          </CardHeader>

          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Your login credentials:</p>
                <p className="text-sm text-muted-foreground">
                  ID: <strong>{formData.email || formData.phoneNumber}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  {formData.email
                    ? "Use your email or phone number and password to sign in."
                    : "Use your phone number and password to sign in."}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Continue to Login
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                e-Results GH v 1.2.0 | PB Pagez LTD
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <img src="/ERESULTS_LOGO.png" alt="e-Results GH Logo" className="w-20 h-20" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
            Create Account
          </CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Sign up to start managing your school results
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  disabled={isLoading}
                  className={`pl-10 h-12 ${errors.fullName ? "border-destructive" : ""}`}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* School Name */}
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <div className="relative">
                <Building2 className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="schoolName"
                  type="text"
                  placeholder="Enter your school name"
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange("schoolName", e.target.value)}
                  required
                  disabled={isLoading}
                  className={`pl-10 h-12 ${errors.schoolName ? "border-destructive" : ""}`}
                />
              </div>
              {errors.schoolName && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.schoolName}
                </p>
              )}
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Optional)</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@school.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isLoading}
                  className={`h-12 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0201234567"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  required
                  disabled={isLoading}
                  className={`pl-10 h-12 ${errors.phoneNumber ? "border-destructive" : ""}`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  disabled={isLoading}
                  className={`pl-10 pr-12 h-12 ${errors.password ? "border-destructive" : ""}`}
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  disabled={isLoading}
                  className={`pl-10 pr-12 h-12 ${errors.confirmPassword ? "border-destructive" : ""}`}
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
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              e-Results GH v {import.meta.env.VITE_APP_VERSION} | PB Pagez LTD
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
