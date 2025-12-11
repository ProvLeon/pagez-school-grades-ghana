
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {title}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {value}
            </p>
            {trend && (
              <div className="flex items-center mt-2 text-xs sm:text-sm">
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1" />
                )}
                <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
                  {trend.value}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            )}
          </div>
          <div className={`${color} p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2 sm:ml-4`}>
            <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
