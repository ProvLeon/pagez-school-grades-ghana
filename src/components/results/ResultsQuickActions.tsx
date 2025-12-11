
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, TrendingUp } from "lucide-react";

interface ResultsQuickActionsProps {
  onAddResult: () => void;
  onManageResults: () => void;
  onViewAnalytics: () => void;
}

const ResultsQuickActions = ({ 
  onAddResult, 
  onManageResults, 
  onViewAnalytics 
}: ResultsQuickActionsProps) => {
  const quickActions = [
    {
      title: "Add New Result",
      description: "Create a new student result record",
      icon: Plus,
      color: "from-blue-600 to-indigo-600",
      hoverColor: "hover:from-blue-700 hover:to-indigo-700",
      onClick: onAddResult
    },
    {
      title: "Manage Results",
      description: "View and manage all student results",
      icon: FileText,
      color: "from-green-600 to-emerald-600",
      hoverColor: "hover:from-green-700 hover:to-emerald-700",
      onClick: onManageResults
    },
    {
      title: "Analytics",
      description: "View performance analytics and reports",
      icon: TrendingUp,
      color: "from-purple-600 to-violet-600",
      hoverColor: "hover:from-purple-700 hover:to-violet-700",
      onClick: onViewAnalytics
    }
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-auto p-4 md:p-6 flex flex-col items-start gap-3 hover:scale-[1.02] transition-all duration-200 bg-gradient-to-br ${action.color} ${action.hoverColor} text-white border-0 shadow-lg`}
              onClick={action.onClick}
            >
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <action.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm md:text-base mb-1">{action.title}</h3>
                <p className="text-xs md:text-sm opacity-90">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsQuickActions;
