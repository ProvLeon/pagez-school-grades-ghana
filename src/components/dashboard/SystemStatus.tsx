
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Server, Database } from "lucide-react";

export const SystemStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5 text-muted-foreground" />
          <span>System Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Server className="w-4 h-4" />
            <span>Server</span>
          </div>
          <div className="flex items-center gap-2 text-green-500 font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Online</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Database className="w-4 h-4" />
            <span>Database</span>
          </div>
          <div className="flex items-center gap-2 text-green-500 font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Connected</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Backup</span>
          <span className="font-medium">2 hours ago</span>
        </div>
      </CardContent>
    </Card>
  );
};
