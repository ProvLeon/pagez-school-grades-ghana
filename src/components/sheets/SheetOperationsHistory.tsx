import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { History, Eye, Download, AlertCircle, CheckCircle, Clock, XCircle, Loader2, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export const SheetOperationsHistory = () => {
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['sheet-operations-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sheet_operations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', text: 'Completed', variant: 'secondary' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-500', text: 'Failed', variant: 'destructive' };
      case 'processing':
        return { icon: Loader2, color: 'text-blue-500', text: 'Processing', variant: 'default' };
      default:
        return { icon: Clock, color: 'text-orange-500', text: 'Pending', variant: 'outline' };
    }
  };

  const getOperationTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      student_upload: 'Student Upload',
      results_upload: 'Results Upload',
      template_download: 'Template Download',
      report_export: 'Report Export'
    };
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Operations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
          ) : operations.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No Operations Yet</h3>
              <p className="text-muted-foreground">Your sheet operations will appear here once you perform an action.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.map((op) => {
                    const statusInfo = getStatusInfo(op.status);
                    return (
                      <TableRow key={op.id}>
                        <TableCell>
                          <p className="font-medium">{getOperationTypeDisplay(op.operation_type)}</p>
                          <p className="text-xs text-muted-foreground">{op.id.slice(0, 8)}</p>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{op.file_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant as any}>
                            <statusInfo.icon className={`w-4 h-4 mr-2 ${statusInfo.color} ${op.status === 'processing' ? 'animate-spin' : ''}`} />
                            {statusInfo.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {op.processed_records || 0} / {op.total_records || 0}
                          {op.failed_records > 0 && (
                            <p className="text-xs text-destructive">{op.failed_records} failed</p>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(op.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                              {op.status === 'completed' && op.file_path && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Download File</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/*<Card>*/}
      {/*  <CardHeader>*/}
      {/*    <CardTitle className="flex items-center gap-2 text-base">*/}
      {/*      <Info className="w-5 h-5 text-muted-foreground" />*/}
      {/*      Understanding Operation History*/}
      {/*    </CardTitle>*/}
      {/*  </CardHeader>*/}
      {/*  <CardContent>*/}
      {/*    <p className="text-sm text-muted-foreground leading-relaxed">*/}
      {/*      This table displays the 20 most recent operations you have performed. You can track the status of each task—from pending to completed or failed. For uploads, the "Records" column shows how many items were successfully processed out of the total. Use the action buttons to view more details or download any generated files.*/}
      {/*    </p>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}
    </div>
  );
};