import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Upload, Download, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const SheetsStatsCards = () => {
    const { data: templatesCount = 0, isLoading: loadingTemplates } = useQuery({
        queryKey: ['sheet-templates-count'],
        queryFn: async () => {
            const { count } = await supabase
                .from('sheet_templates')
                .select('*', { count: 'exact', head: true });
            return count || 0;
        }
    });

    const { data: recentOperations = 0, isLoading: loadingRecent } = useQuery({
        queryKey: ['recent-operations-count'],
        queryFn: async () => {
            const { count } = await supabase
                .from('sheet_operations')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
            return count || 0;
        }
    });

    const { data: pendingOperations = 0, isLoading: loadingPending } = useQuery({
        queryKey: ['pending-operations-count'],
        queryFn: async () => {
            const { count } = await supabase
                .from('sheet_operations')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            return count || 0;
        }
    });

    const { data: reportsGenerated = 0, isLoading: loadingReports } = useQuery({
        queryKey: ['reports-generated-count'],
        queryFn: async () => {
            const { count } = await supabase
                .from('sheet_operations')
                .select('*', { count: 'exact', head: true })
                .eq('operation_type', 'report_export')
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
            return count || 0;
        }
    });

    const stats = [
        {
            title: "Active Templates",
            value: templatesCount,
            icon: FileSpreadsheet,
            iconColor: "text-primary",
            bgColor: "bg-primary/10",
            isLoading: loadingTemplates,
        },
        {
            title: "Recent Operations",
            value: recentOperations,
            subtitle: "Last 7 days",
            icon: Upload,
            iconColor: "text-primary/80",
            bgColor: "bg-primary/8",
            isLoading: loadingRecent,
        },
        {
            title: "Pending Operations",
            value: pendingOperations,
            icon: Clock,
            iconColor: "text-primary/90",
            bgColor: "bg-primary/12",
            isLoading: loadingPending,
        },
        {
            title: "Reports Generated",
            value: reportsGenerated,
            subtitle: "This month",
            icon: Download,
            iconColor: "text-primary",
            bgColor: "bg-primary/15",
            isLoading: loadingReports,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardContent className="pt-6">
                            {stat.isLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                        {stat.subtitle && (
                                            <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                                        )}
                                    </div>
                                    <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                                        <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};