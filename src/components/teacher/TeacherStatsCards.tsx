
import { Card, CardContent } from "@/components/ui/card";
import { User, Shield, BookOpen, UserCheck } from "lucide-react";

interface TeacherStatsCardsProps {
  totalTeachers: number;
  activeTeachers: number;
  departmentCount: number;
  assignmentCount: number;
}

const TeacherStatsCards = ({
  totalTeachers,
  activeTeachers,
  departmentCount,
  assignmentCount
}: TeacherStatsCardsProps) => {
  const stats = [
    { title: "Total Teachers", value: totalTeachers, icon: User, color: "text-blue-500" },
    { title: "Active Teachers", value: activeTeachers, icon: Shield, color: "text-green-500" },
    { title: "Departments", value: departmentCount, icon: BookOpen, color: "text-yellow-500" },
    { title: "Assignments", value: assignmentCount, icon: UserCheck, color: "text-purple-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TeacherStatsCards;
