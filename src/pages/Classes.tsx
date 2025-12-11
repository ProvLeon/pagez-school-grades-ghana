
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Search, Filter, LayoutGrid, List, Info, X } from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { AddClassDialog } from "@/components/AddClassDialog";
import { ClassesTable } from "@/components/ClassesTable";
import { ClassesStats } from "@/components/ClassesStats";
import { ClassesQuickActions } from "@/components/ClassesQuickActions";
import { ClassesRecentUpdates } from "@/components/ClassesRecentUpdates";

const Classes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showGuides, setShowGuides] = useState(true);

  const { data: classes = [], isLoading, error } = useClasses();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Manage Classes" subtitle="Organize and manage your school classes" />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium text-muted-foreground">Loading classes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Manage Classes" subtitle="Organize and manage your school classes" />
        <main className="container mx-auto px-4 py-6">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-6 text-center text-destructive">
              <h3 className="font-semibold">Error Loading Classes</h3>
              <p className="text-sm">Something went wrong. Please try again later.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Manage Classes" subtitle="Organize and manage your school classes" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {showGuides && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Class Management Guide</AlertTitle>
            <AlertDescription>
              Use this page to add, organize, and monitor all school classes. You can assign teachers, group classes by department, and track performance.
            </AlertDescription>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setShowGuides(false)}><X className="h-4 w-4" /></Button>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search classes, teachers..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <AddClassDialog
              trigger={
                <Button className="gap-2 w-full md:w-auto">
                  <Plus className="w-4 h-4" />
                  <span>Add Class</span>
                </Button>
              }
            />
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <ClassesTable classes={classes} searchTerm={searchTerm} />
          </div>
          <div className="space-y-6">
            <ClassesStats classes={classes} />
            <ClassesQuickActions />
            <ClassesRecentUpdates classes={classes} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Classes;
