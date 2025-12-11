import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, AlertCircle, LogIn } from "lucide-react";
import { authService, LoginCredentials } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
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
          description: "Welcome back to PB Pagez!",
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
            <img src="/lovable-uploads/97e233bb-185f-4d11-9bc3-52cabe2bef85.png" alt="Logo" className="w-20 h-20" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
            PB Pagez School System
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
              Need access?{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => {
                  toast({
                    title: "Contact Administrator",
                    description: "Please contact your system administrator at admin@pbpagez.com for account assistance.",
                  });
                }}
              >
                Contact Admin
              </button>
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              PB Pagez v{import.meta.env.VITE_APP_VERSION || '1.0.0'} | Secure Academic Management
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
