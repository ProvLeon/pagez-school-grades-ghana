import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const NoOrganization = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            No Organization Found
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            You are not associated with any school or organization yet.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 text-center text-sm">
            <p className="text-muted-foreground">
              Please contact your school administrator to add you to their organization.
            </p>
            <p className="text-muted-foreground mt-2">
              If you believe this is an error, try logging out and logging in again.
            </p>
          </div>

          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoOrganization;
