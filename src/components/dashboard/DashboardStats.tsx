
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; isPositive: boolean };
}

interface DashboardStatsProps {
  stats: StatItem[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="dashboard-stats">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.trend && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={cn("font-medium", stat.trend.isPositive ? "text-green-600" : "text-red-600")}>
                  {stat.trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.trend.value}
                </span>
                <span>vs last month</span>
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
