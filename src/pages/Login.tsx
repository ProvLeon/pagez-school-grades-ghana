import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, AlertCircle, LogIn } from "lucide-react";
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

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/10">
        <div className="text-center space-y-6">
          {/* Logo with circular pulse animation */}
          <div className="relative flex justify-center">
            {/* Outer pulse rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-2 border-blue-400/30 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-blue-300/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
            </div>

            {/* Rotating ring around logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-24 h-24 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin"
                style={{ animationDuration: '1.5s' }}
              />
            </div>

            {/* Logo container */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-xl ring-4 ring-white dark:ring-gray-800 z-10">
              <img
                src="/ERESULTS_LOGO.png"
                alt="PB Pagez"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
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

  // If authenticated, redirect immediately - don't render anything else
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.signIn(formData);

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back to e-Results GH!",
          variant: "default",
        });
        // AuthContext will update and trigger re-render with Navigate
      } else {
        toast({
          title: "Login Failed",
          description: result.error?.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "System Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <img src="/ERESULTS_LOGO.png" alt="e-Results GH Logo" className="w-20 h-20" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
            e-Results GH
          </CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Secure access to your academic dashboard
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                  className={`pl-10 h-12 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  disabled={isLoading}
                  className={`pl-10 pr-12 h-12 ${errors.password ? 'border-destructive' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
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

            <Button
              type="submit"
              className="w-full h-12 font-semibold shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign Up
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

export default Login;
