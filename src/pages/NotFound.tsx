import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
            <Home className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
          <p className="text-sm text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
