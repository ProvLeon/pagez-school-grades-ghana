import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, FileText, Search, Download, AlertCircle, CheckCircle, GraduationCap, Calendar, Users, Sparkles } from 'lucide-react';
import { usePublicReportSearch, usePublicReportGeneration, usePublicSearchData } from '@/hooks/usePublicReports';

const PublicReports = () => {
  const [studentId, setStudentId] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState('');
  const [classId, setClassId] = useState('');

  const { result, isLoading: isSearching, error, searchReport, clearSearch } = usePublicReportSearch();
  const { isGenerating, generatePublicReport } = usePublicReportGeneration();
  const { classes, academicYears, terms } = usePublicSearchData();

  const resultCardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to result card when report is found
  useEffect(() => {
    if (result && resultCardRef.current) {
      resultCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [result]);

  const handleSearch = () => {
    if (!studentId || !academicYear || !term || !classId) {
      return;
    }
    searchReport({ studentId, academicYear, term, classId });
  };

  const handleDownload = async () => {
    if (result?.id) {
      await generatePublicReport(result.id);
    }
  };

  const handleClear = () => {
    setStudentId('');
    setAcademicYear('');
    setTerm('');
    setClassId('');
    clearSearch();
  };

  const filteredClasses = classes.filter(c => c.academic_year === academicYear);
  const isFormValid = studentId && academicYear && term && classId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="relative container mx-auto px-4 py-12 lg:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
              Student Report Portal
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Securely access and download your published academic reports with ease
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Digital Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Secure Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Instant Download</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Search Form */}
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center gap-2 text-primary mb-2">
                <Search className="h-5 w-5" />
                <CardTitle className="text-xl">Find Your Report</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your details to search for published reports
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Student ID
                  </Label>
                  <Input
                    id="studentId"
                    placeholder="e.g., PI25W9K"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="academicYear" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Academic Year
                    </Label>
                    <Select value={academicYear} onValueChange={setAcademicYear}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="term" className="text-sm font-medium">Term</Label>
                    <Select value={term} onValueChange={setTerm}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        {terms.map((termOption) => (
                          <SelectItem key={termOption} value={termOption}>
                            {termOption.charAt(0).toUpperCase() + termOption.slice(1)} Term
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class" className="text-sm font-medium">Class</Label>
                  <Select value={classId} onValueChange={setClassId} disabled={!academicYear}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={academicYear ? "Select your class" : "Select academic year first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredClasses.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleSearch}
                  disabled={!isFormValid || isSearching}
                  className="flex-1 h-12 text-base font-medium"
                  size="lg"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Report
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleClear} className="h-12 px-6">
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isSearching && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-3 py-8">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-primary">Searching for your report</p>
                    <p className="text-sm text-muted-foreground">This may take a moment...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Report not found</p>
                  <p className="text-sm">Please verify your details and ensure the report has been published by your school.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success State */}
          {result && (
            <Card ref={resultCardRef} className="border-emerald-200 bg-emerald-50/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-emerald-800 text-lg">Report Found!</CardTitle>
                    <p className="text-sm text-emerald-600">Your report is ready for download</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Student Name</Label>
                    <p className="font-semibold text-lg">{result.students?.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Student ID</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{result.students?.student_id}</p>
                      <Badge variant="outline" className="text-xs">Verified</Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Class</Label>
                    <p className="font-semibold">{result.classes?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Academic Period</Label>
                    <p className="font-semibold">
                      {result.academic_year} • {result.term.charAt(0).toUpperCase() + result.term.slice(1)} Term
                    </p>
                  </div>
                </div>

                <Separator />

                <Button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="w-full h-12 text-base font-medium bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Report Card
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* No Results Found */}
          {result === null && !isSearching && isFormValid && !error && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-800 mb-2">No Report Found</p>
                    <div className="text-sm text-amber-700 space-y-2">
                      <p>Please double-check:</p>
                      <ul className="text-left max-w-xs mx-auto space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span>Student ID is correct</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span>Academic year and term match</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span>Class selection is accurate</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span>Report has been published</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <h3 className="font-semibold text-sm text-foreground">Report Portal Guide</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="space-y-1.5">
                      <p className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span><strong>Enter Details:</strong> Use the exact student ID provided by your school</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span><strong>Select Period:</strong> Choose the correct academic year and term</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span><strong>Search Report:</strong> Click search to find your published report</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span><strong>Download:</strong> Get your PDF report instantly</span>
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <span><strong>Do Not:</strong> Share your student ID or report details with unauthorized persons</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <span><strong>Avoid:</strong> Using incorrect details which may prevent finding your report</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Security:</strong> Reports are only accessible once published by your school</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Support:</strong> Contact your school if you cannot find your report</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicReports;
