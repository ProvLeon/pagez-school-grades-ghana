
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; isPositive: boolean };
  description?: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="dashboard-stats">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.15)] border border-slate-100 dark:border-border"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-muted-foreground tracking-tight">{stat.title}</h3>
              <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-card-foreground">{stat.value}</p>
            </div>
            
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20">
              <stat.icon className="h-6 w-6 stroke-[1.5]" />
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div className="min-h-[20px]">
              {stat.trend && (
                <p className="flex items-center gap-1 text-xs font-medium">
                  <span className={cn("flex items-center rounded-sm px-1.5 py-0.5", stat.trend.isPositive ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400")}>
                    {stat.trend.isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                    {stat.trend.value}
                  </span>
                </p>
              )}
              {stat.description && !stat.trend && (
                <p className="text-xs font-medium text-slate-400 dark:text-muted-foreground">{stat.description}</p>
              )}
            </div>

            {/* Stylized Mock Sparkline */}
            <div className="h-6 w-16 opacity-40 mix-blend-multiply dark:mix-blend-lighten transition-opacity duration-300 group-hover:opacity-100">
              <svg viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                <path 
                  d={index % 2 === 0 ? "M0 25C15 25 20 5 40 15C60 25 75 5 100 10" : "M0 15C20 25 30 5 50 15C70 25 80 5 100 10"} 
                  stroke={index % 2 === 0 ? "#10b981" : "#3b82f6"} 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
