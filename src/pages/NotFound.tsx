import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, SearchX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-lg rounded-2xl bg-white dark:bg-card shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 to-primary" />
        <CardContent className="pt-12 pb-10 px-8 text-center flex flex-col items-center">
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-lg animate-pulse" />
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center relative shadow-inner border border-white/50 dark:border-white/10">
              <SearchX className="h-10 w-10 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground mb-3">
            404
          </h1>
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm text-lg">
            We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)} 
              className="gap-2 h-12 px-6 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-sm text-base"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="gap-2 h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_2px_10px_-3px_rgba(6,81,237,0.2)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.25)] transition-all duration-300 hover:-translate-y-1 text-base font-medium"
            >
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
