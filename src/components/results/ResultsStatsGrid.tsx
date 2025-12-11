
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, BarChart3, Calendar, TrendingUp } from "lucide-react";

interface ResultsStatsGridProps {
  resultsCount: number;
  classesCount: number;
  studentsCount: number;
  currentTermCount: number;
}

const ResultsStatsGrid = ({ 
  resultsCount, 
  classesCount, 
  studentsCount, 
  currentTermCount 
}: ResultsStatsGridProps) => {
  const stats = [
    {
      title: "Total Results",
      value: resultsCount,
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      change: "+12%",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Active Classes",
      value: classesCount,
      icon: Users,
      color: "from-green-500 to-green-600",
      change: "+5%",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Students",
      value: studentsCount,
      icon: BarChart3,
      color: "from-purple-500 to-purple-600",
      change: "+8%",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "This Term",
      value: currentTermCount,
      icon: Calendar,
      color: "from-orange-500 to-orange-600",
      change: "+15%",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-md">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResultsStatsGrid;
