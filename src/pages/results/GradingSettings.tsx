
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import AcademicSettingsCard from "@/components/grading/AcademicSettingsCard";
import { useGradingSettingsForm } from "@/hooks/useGradingSettingsForm";
import GradingTable from "@/components/grading/GradingTable";
import CommentSection from "@/components/grading/CommentSection";

const GradingSettings = () => {
  const {
    // Academic settings
    academicYear,
    setAcademicYear,
    term,
    setTerm,
    attendanceForTerm,
    setAttendanceForTerm,
    termBegin,
    setTermBegin,
    termEnds,
    setTermEnds,
    nextTermBegin,
    setNextTermBegin,

    // Grading scales
    kgGrading,
    primaryGrading,
    jhsGrading,

    // Comment options
    conductOptions,
    attitudeOptions,
    interestOptions,
    teacherCommentOptions,

    // Actions
    addGradingRow,
    removeGradingRow,
    updateGradingRow,
    addCommentOption,
    removeCommentOption,
    updateCommentOption,
    handleSave,
    isSaving
  } = useGradingSettingsForm();

  // Create a wrapper function to handle the term setting with proper typing
  const handleTermChange = (value: string) => {
    if (value === "first" || value === "second" || value === "third") {
      setTerm(value);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Grading Settings"
        subtitle="Configure academic year, grading scales, and comment options"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,280px] gap-12">
          <div className="space-y-12">
            {/* Section 1: Academic Settings */}
            <section id="academic-settings" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-foreground">Academic Settings</h2>
              <p className="text-muted-foreground mt-1">
                Set the academic year, term, and important dates for report cards.
              </p>
              <div className="mt-6">
                <AcademicSettingsCard
                  academicYear={academicYear}
                  setAcademicYear={setAcademicYear}
                  term={term}
                  setTerm={handleTermChange}
                  attendanceForTerm={attendanceForTerm}
                  setAttendanceForTerm={setAttendanceForTerm}
                  termBegin={termBegin}
                  setTermBegin={setTermBegin}
                  termEnds={termEnds}
                  setTermEnds={setTermEnds}
                  nextTermBegin={nextTermBegin}
                  setNextTermBegin={setNextTermBegin}
                />
              </div>
            </section>

            {/* Section 2: Grading Scales */}
            <section id="grading-scales" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-foreground">Grading Scales</h2>
              <p className="text-muted-foreground mt-1">
                Define grading scales for different school departments.
              </p>
              <Card className="mt-6">
                <CardContent className="p-6">
                  <Tabs defaultValue="kg" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-auto">
                      <TabsTrigger value="kg" className="py-2">KG</TabsTrigger>
                      <TabsTrigger value="primary" className="py-2">PRIMARY</TabsTrigger>
                      <TabsTrigger value="jhs" className="py-2">JUNIOR HIGH</TabsTrigger>
                    </TabsList>

                    <TabsContent value="kg" className="pt-6">
                      <GradingTable
                        department="kg"
                        grading={kgGrading}
                        onAddRow={addGradingRow}
                        onRemoveRow={removeGradingRow}
                        onUpdateRow={updateGradingRow}
                      />
                    </TabsContent>

                    <TabsContent value="primary" className="pt-6">
                      <GradingTable
                        department="primary"
                        grading={primaryGrading}
                        onAddRow={addGradingRow}
                        onRemoveRow={removeGradingRow}
                        onUpdateRow={updateGradingRow}
                      />
                    </TabsContent>

                    <TabsContent value="jhs" className="pt-6">
                      <GradingTable
                        department="jhs"
                        grading={jhsGrading}
                        onAddRow={addGradingRow}
                        onRemoveRow={removeGradingRow}
                        onUpdateRow={updateGradingRow}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </section>

            {/* Section 3: Comment Options */}
            <section id="comment-options" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-foreground">Comment Options</h2>
              <p className="text-muted-foreground mt-1">
                Manage predefined comments for report cards.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <CommentSection
                  title="Conduct"
                  options={conductOptions}
                  type="conduct"
                  onAddOption={addCommentOption}
                  onRemoveOption={removeCommentOption}
                  onUpdateOption={updateCommentOption}
                />
                <CommentSection
                  title="Attitude"
                  options={attitudeOptions}
                  type="attitude"
                  onAddOption={addCommentOption}
                  onRemoveOption={removeCommentOption}
                  onUpdateOption={updateCommentOption}
                />
                <CommentSection
                  title="Interest"
                  options={interestOptions}
                  type="interest"
                  onAddOption={addCommentOption}
                  onRemoveOption={removeCommentOption}
                  onUpdateOption={updateCommentOption}
                />
                <CommentSection
                  title="Teacher Comment"
                  options={teacherCommentOptions}
                  type="teacher"
                  onAddOption={addCommentOption}
                  onRemoveOption={removeCommentOption}
                  onUpdateOption={updateCommentOption}
                />
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <h3 className="font-semibold text-foreground">On this page</h3>
              <nav>
                <ul className="space-y-2">
                  <li><a href="#academic-settings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Academic Settings</a></li>
                  <li><a href="#grading-scales" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Grading Scales</a></li>
                  <li><a href="#comment-options" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Comment Options</a></li>
                </ul>
              </nav>
              <div className="pt-6">
                <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2">
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save All Settings</>
                  )}
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* Floating Save Button for mobile/tablet */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Button onClick={handleSave} disabled={isSaving} size="lg" className="rounded-full shadow-2xl w-16 h-16 p-0">
            {isSaving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            <span className="sr-only">Save Settings</span>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GradingSettings;
