import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Trash2, X, Plus, TrendingUp, Calendar, Award, FileText, Users, BarChart3 } from "lucide-react";
import { CreateMockSessionDialog } from "@/components/mock/CreateMockSessionDialog";
import { AddScoresDialog } from "@/components/mock/AddScoresDialog";
import { DeleteMockSessionDialog } from "@/components/mock/DeleteMockSessionDialog";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useMockExamSessions, useDeleteMockExamSession } from "@/hooks/useMockExams";
import { useMockExamResults, useDeleteAllMockResults } from "@/hooks/useMockExamResults";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { calculateMockGrade } from "@/utils/mockGradeCalculations";

export default function MockExams() {
    const { toast } = useToast();
    const { data: sessions = [], isLoading: sessionsLoading } = useMockExamSessions();
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const { data: results = [], isLoading: resultsLoading, refetch: refetchResults } = useMockExamResults(selectedSessionId);
    const deleteAll = useDeleteAllMockResults();
    const { settings } = useSchoolSettings();
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

    useEffect(() => {
        if (!selectedSessionId && sessions.length) setSelectedSessionId(sessions[0].id);
    }, [sessions, selectedSessionId]);

    const filteredResults = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return (q ? results.filter(r => r.student_name.toLowerCase().includes(q)) : results).sort((a, b) => (a.position || 999) - (b.position || 999));
    }, [results, searchTerm]);

    const currentSession = sessions.find((s) => s.id === selectedSessionId);

    const handleExportPDF = () => { /* ... PDF export logic ... */ };
    const generateAnalysisPDF = () => { /* ... PDF analysis logic ... */ };

    const handleDeleteAllResults = () => {
        if (!selectedSessionId) return;
        deleteAll.mutate({ sessionId: selectedSessionId }, {
            onSuccess: () => {
                toast({ title: "Results Deleted" });
                setShowDeleteAllModal(false);
                refetchResults();
            },
            onError: (error: any) => toast({ title: "Delete Failed", description: error.message, variant: "destructive" }),
        });
    };

    const stats = {
        students: results.length,
        avgScore: results.length ? Math.round((results.reduce((sum, r) => sum + (Number(r.total_score) || 0), 0) / results.length)) : 0,
    };

    return (
        <div className="min-h-screen bg-background">
            <Header title="Mock Examinations" subtitle="Manage sessions, scores, and reports" />

            <main className="container mx-auto px-4 py-6 space-y-6">
                {currentSession && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Students" value={stats.students} icon={Users} />
                        <StatCard title="Average Score" value={`${stats.avgScore}%`} icon={TrendingUp} />
                        <StatCard title="Academic Year" value={currentSession.academic_year} icon={Calendar} />
                        <StatCard title="Term" value={currentSession.term} icon={Award} />
                    </div>
                )}

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <Select value={selectedSessionId || ""} onValueChange={setSelectedSessionId} disabled={sessionsLoading || sessions.length === 0}>
                                <SelectTrigger className="w-full md:w-72"><SelectValue placeholder="Select a session..." /></SelectTrigger>
                                <SelectContent>{sessions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <CreateMockSessionDialog><Button className="w-full md:w-auto"><Plus className="h-4 w-4 mr-2" />New Session</Button></CreateMockSessionDialog>
                                <AddScoresDialog sessionId={selectedSessionId} onSuccess={refetchResults}><Button variant="outline" className="w-full md:w-auto" disabled={!selectedSessionId}>Add Scores</Button></AddScoresDialog>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {sessionsLoading || resultsLoading ? <Skeleton className="h-64 w-full" /> : 
                         !selectedSessionId ? <EmptyState title="No Session Selected" message="Create or select a session to view results." /> : 
                         results.length === 0 ? <EmptyState title="No Results Yet" message="Add scores to this session to begin." /> : 
                        (
                            <>
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                    <Input placeholder="Search by student name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={handleExportPDF}><Download className="h-4 w-4 mr-2" />Export PDF</Button>
                                        <Button variant="outline" size="sm" onClick={generateAnalysisPDF}><FileText className="h-4 w-4 mr-2" />Analysis</Button>
                                        <DeleteMockSessionDialog sessionId={currentSession!.id} sessionName={currentSession!.name} onSuccess={() => setSelectedSessionId(null)}><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-2" />Delete Session</Button></DeleteMockSessionDialog>
                                    </div>
                                </div>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Pos</TableHead><TableHead>Student</TableHead><TableHead>Raw Score</TableHead><TableHead>Aggregate</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {filteredResults.map((result, index) => (
                                                <TableRow key={result.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{result.student_name}</TableCell>
                                                    <TableCell>{result.total_score}%</TableCell>
                                                    <TableCell>{result.position}</TableCell>
                                                    <TableCell><Badge variant="secondary">{calculateMockGrade(result.position || 0)}</Badge></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>

            <ConfirmationModal open={showDeleteAllModal} onOpenChange={setShowDeleteAllModal} onConfirm={handleDeleteAllResults} title="Delete All Results?" description="This will permanently delete all results for this session. This action cannot be undone." confirmLabel="Delete All" isLoading={deleteAll.isPending} />
        </div>
    );
}

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
    </Card>
);

const EmptyState = ({ title, message }: { title: string, message: string }) => (
    <div className="text-center py-16">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
    </div>
);