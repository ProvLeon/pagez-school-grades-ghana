
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, FileText, Settings, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { title: "Add Student", icon: Users, onClick: () => navigate('/students/add-students') },
    { title: "Create Class", icon: BookOpen, onClick: () => navigate('/classes') },
    { title: "Add Results", icon: FileText, onClick: () => navigate('/results/add-results') },
    { title: "Settings", icon: Settings, onClick: () => navigate('/settings') },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full flex justify-between items-center p-3 h-auto"
            onClick={action.onClick}
          >
            <div className="flex items-center gap-3">
              <action.icon className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">{action.title}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
