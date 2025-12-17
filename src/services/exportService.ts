import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

// Custom error class for "no data found" scenarios
export class NoDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoDataError';
  }
}

export interface ExportFilters {
  academicYear: string;
  term: string;
  classId?: string;
  departmentId?: string;
}

export interface StudentResult {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  department_name: string;
  term: string;
  academic_year: string;
  total_score: number;
  total_marks: number;
  average: number;
  position: number;
  grade: string;
  days_present: number;
  days_absent: number;
  days_school_opened: number;
  attendance_percentage: number;
  subjects: {
    name: string;
    code: string;
    ca1_score?: number;
    ca2_score?: number;
    ca3_score?: number;
    ca4_score?: number;
    exam_score?: number;
    total: number;
    grade: string;
    remark: string;
  }[];
}

export interface ClassBroadsheetData {
  className: string;
  departmentName: string;
  academicYear: string;
  term: string;
  subjects: string[];
  students: StudentResult[];
  generatedAt: string;
}

export class ExportService {
  /**
   * Fetch results data for export
   */
  static async fetchResultsData(filters: ExportFilters): Promise<StudentResult[]> {
    let query = supabase
      .from('results')
      .select(`
        *,
        student:students(id, student_id, full_name),
        class:classes(id, name, department:departments(id, name))
      `)
      .eq('academic_year', filters.academicYear)
      .eq('term', filters.term.toLowerCase().replace(' term', ''));

    if (filters.classId) {
      query = query.eq('class_id', filters.classId);
    }

    if (filters.departmentId) {
      query = query.eq('class.department_id', filters.departmentId);
    }

    const { data: results, error } = await query;

    if (error) {
      console.error('Error fetching results:', error);
      throw error;
    }

    if (!results || results.length === 0) {
      return [];
    }

    // Fetch subject marks for all results
    const resultIds = results.map(r => r.id);
    const { data: subjectMarks, error: marksError } = await supabase
      .from('subject_marks')
      .select(`
        *,
        subject:subjects(id, name, code)
      `)
      .in('result_id', resultIds);

    if (marksError) {
      console.error('Error fetching subject marks:', marksError);
      throw marksError;
    }

    // Map results with their subject marks
    const studentResults: StudentResult[] = results.map(result => {
      const studentMarks = subjectMarks?.filter(m => m.result_id === result.id) || [];

      const subjects = studentMarks.map(mark => ({
        name: mark.subject?.name || 'Unknown',
        code: mark.subject?.code || '',
        ca1_score: mark.ca1_score,
        ca2_score: mark.ca2_score,
        ca3_score: mark.ca3_score,
        ca4_score: mark.ca4_score,
        exam_score: mark.exam_score,
        total: mark.total_score || 0,
        grade: mark.grade || '',
        remark: mark.remark || ''
      }));

      const totalScore = subjects.reduce((sum, s) => sum + s.total, 0);
      const totalMarks = subjects.length * 100;
      const average = subjects.length > 0 ? totalScore / subjects.length : 0;

      const attendancePercentage = result.days_school_opened > 0
        ? ((result.days_present || 0) / result.days_school_opened) * 100
        : 0;

      return {
        id: result.id,
        student_id: result.student?.student_id || '',
        student_name: result.student?.full_name || '',
        class_name: result.class?.name || '',
        department_name: result.class?.department?.name || '',
        term: result.term,
        academic_year: result.academic_year,
        total_score: totalScore,
        total_marks: totalMarks,
        average: Math.round(average * 100) / 100,
        position: result.overall_position || 0,
        grade: this.calculateGrade(average),
        days_present: result.days_present || 0,
        days_absent: result.days_absent || 0,
        days_school_opened: result.days_school_opened || 0,
        attendance_percentage: Math.round(attendancePercentage * 100) / 100,
        subjects
      };
    });

    // Sort by average descending and assign positions
    studentResults.sort((a, b) => b.average - a.average);
    studentResults.forEach((student, index) => {
      student.position = index + 1;
    });

    return studentResults;
  }

  /**
   * Calculate grade based on average score
   */
  static calculateGrade(average: number): string {
    if (average >= 80) return 'A';
    if (average >= 70) return 'B';
    if (average >= 60) return 'C';
    if (average >= 50) return 'D';
    if (average >= 40) return 'E';
    return 'F';
  }

  /**
   * Generate Class Broadsheet Excel file
   */
  static async generateClassBroadsheet(filters: ExportFilters): Promise<void> {
    const results = await this.fetchResultsData(filters);

    if (results.length === 0) {
      throw new NoDataError(
        'No results found for the selected filters. Please ensure that results have been entered for the selected term, academic year, and class/department.'
      );
    }

    // Get unique subjects across all students
    const allSubjects = new Map<string, string>();
    results.forEach(student => {
      student.subjects.forEach(subject => {
        allSubjects.set(subject.code || subject.name, subject.name);
      });
    });
    const subjectList = Array.from(allSubjects.entries());

    const workbook = XLSX.utils.book_new();

    // Create header rows
    const className = results[0]?.class_name || 'All Classes';
    const departmentName = results[0]?.department_name || '';
    const termName = filters.term;
    const academicYear = filters.academicYear;

    // Title section
    const titleRows = [
      ['CLASS BROADSHEET'],
      [''],
      [`Class: ${className}`, '', `Department: ${departmentName}`],
      [`Term: ${termName}`, '', `Academic Year: ${academicYear}`],
      [`Generated: ${new Date().toLocaleDateString('en-GB')}`],
      ['']
    ];

    // Build header row
    const headerRow = [
      'Pos',
      'Student ID',
      'Student Name',
      ...subjectList.map(([_, name]) => name),
      'Total',
      'Average',
      'Grade',
      'Days Present',
      'Days Absent',
      'Attendance %'
    ];

    // Build data rows
    const dataRows = results.map(student => {
      const subjectScores = subjectList.map(([code, name]) => {
        const subject = student.subjects.find(s => (s.code || s.name) === code || s.name === name);
        return subject ? subject.total : '';
      });

      return [
        student.position,
        student.student_id,
        student.student_name,
        ...subjectScores,
        student.total_score,
        student.average,
        student.grade,
        student.days_present,
        student.days_absent,
        `${student.attendance_percentage}%`
      ];
    });

    // Summary statistics
    const summaryRows = [
      [''],
      ['SUMMARY STATISTICS'],
      [''],
      ['Total Students:', results.length],
      ['Class Average:', Math.round(results.reduce((sum, s) => sum + s.average, 0) / results.length * 100) / 100],
      ['Highest Score:', Math.max(...results.map(s => s.average))],
      ['Lowest Score:', Math.min(...results.map(s => s.average))],
      ['Pass Rate (≥50%):', `${Math.round((results.filter(s => s.average >= 50).length / results.length) * 100)}%`]
    ];

    // Combine all rows
    const allRows = [
      ...titleRows,
      headerRow,
      ...dataRows,
      ...summaryRows
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(allRows);

    // Set column widths
    const colWidths = [
      { width: 5 },   // Position
      { width: 12 },  // Student ID
      { width: 25 },  // Student Name
      ...subjectList.map(() => ({ width: 10 })), // Subject columns
      { width: 8 },   // Total
      { width: 10 },  // Average
      { width: 8 },   // Grade
      { width: 12 },  // Days Present
      { width: 12 },  // Days Absent
      { width: 12 }   // Attendance %
    ];
    worksheet['!cols'] = colWidths;

    // Add merge for title
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headerRow.length - 1 } }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Broadsheet');

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Class_Broadsheet_${className.replace(/\s+/g, '_')}_${termName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);
  }

  /**
   * Generate Position Rankings Excel file
   */
  static async generatePositionRankings(filters: ExportFilters): Promise<void> {
    const results = await this.fetchResultsData(filters);

    if (results.length === 0) {
      throw new NoDataError(
        'No results found for position rankings. Please ensure that results have been entered for the selected term and academic year.'
      );
    }

    const workbook = XLSX.utils.book_new();

    // Title section
    const titleRows = [
      ['STUDENT POSITION RANKINGS'],
      [''],
      [`Academic Year: ${filters.academicYear}`, '', `Term: ${filters.term}`],
      [`Generated: ${new Date().toLocaleDateString('en-GB')}`],
      ['']
    ];

    // Header row
    const headerRow = [
      'Position',
      'Student ID',
      'Student Name',
      'Class',
      'Department',
      'Total Score',
      'Average',
      'Grade',
      'Remark'
    ];

    // Data rows
    const dataRows = results.map(student => [
      student.position,
      student.student_id,
      student.student_name,
      student.class_name,
      student.department_name,
      student.total_score,
      student.average,
      student.grade,
      this.getPerformanceRemark(student.average)
    ]);

    // Combine all rows
    const allRows = [
      ...titleRows,
      headerRow,
      ...dataRows
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(allRows);

    // Set column widths
    worksheet['!cols'] = [
      { width: 10 },  // Position
      { width: 12 },  // Student ID
      { width: 25 },  // Student Name
      { width: 15 },  // Class
      { width: 15 },  // Department
      { width: 12 },  // Total Score
      { width: 10 },  // Average
      { width: 8 },   // Grade
      { width: 15 }   // Remark
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rankings');

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Position_Rankings_${filters.term.replace(/\s+/g, '_')}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);
  }

  /**
   * Generate Department Summary PDF data
   */
  static async generateDepartmentSummary(filters: ExportFilters): Promise<{
    summary: {
      departmentName: string;
      totalStudents: number;
      averageScore: number;
      passRate: number;
      gradeDistribution: { grade: string; count: number; percentage: number }[];
      classPerformance: { className: string; average: number; passRate: number }[];
    }
  }> {
    const results = await this.fetchResultsData(filters);

    if (results.length === 0) {
      throw new NoDataError(
        'No results found for department summary. Please ensure that results have been entered for the selected department, term, and academic year.'
      );
    }

    // Group by class
    const classesSummary = new Map<string, StudentResult[]>();
    results.forEach(student => {
      const existing = classesSummary.get(student.class_name) || [];
      existing.push(student);
      classesSummary.set(student.class_name, existing);
    });

    // Calculate grade distribution
    const gradeCount = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    results.forEach(student => {
      const grade = student.grade as keyof typeof gradeCount;
      if (gradeCount[grade] !== undefined) {
        gradeCount[grade]++;
      }
    });

    const gradeDistribution = Object.entries(gradeCount).map(([grade, count]) => ({
      grade,
      count,
      percentage: Math.round((count / results.length) * 100)
    }));

    // Calculate class performance
    const classPerformance = Array.from(classesSummary.entries()).map(([className, students]) => ({
      className,
      average: Math.round(students.reduce((sum, s) => sum + s.average, 0) / students.length * 100) / 100,
      passRate: Math.round((students.filter(s => s.average >= 50).length / students.length) * 100)
    }));

    return {
      summary: {
        departmentName: results[0]?.department_name || 'All Departments',
        totalStudents: results.length,
        averageScore: Math.round(results.reduce((sum, s) => sum + s.average, 0) / results.length * 100) / 100,
        passRate: Math.round((results.filter(s => s.average >= 50).length / results.length) * 100),
        gradeDistribution,
        classPerformance
      }
    };
  }

  /**
   * Generate Attendance Summary data
   */
  static async generateAttendanceSummary(filters: ExportFilters): Promise<{
    students: {
      studentId: string;
      studentName: string;
      className: string;
      daysPresent: number;
      daysAbsent: number;
      daysOpened: number;
      attendanceRate: number;
    }[];
    summary: {
      totalStudents: number;
      averageAttendance: number;
      perfectAttendance: number;
      belowThreshold: number;
    }
  }> {
    const results = await this.fetchResultsData(filters);

    if (results.length === 0) {
      throw new NoDataError(
        'No attendance data found. Attendance is recorded as part of student results. Please ensure results have been entered with attendance information.'
      );
    }

    const students = results.map(student => ({
      studentId: student.student_id,
      studentName: student.student_name,
      className: student.class_name,
      daysPresent: student.days_present,
      daysAbsent: student.days_absent,
      daysOpened: student.days_school_opened,
      attendanceRate: student.attendance_percentage
    }));

    const averageAttendance = Math.round(
      students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length * 100
    ) / 100;

    return {
      students,
      summary: {
        totalStudents: students.length,
        averageAttendance,
        perfectAttendance: students.filter(s => s.attendanceRate === 100).length,
        belowThreshold: students.filter(s => s.attendanceRate < 80).length
      }
    };
  }

  /**
   * Generate Student Performance Analysis data
   */
  static async generateStudentPerformance(filters: ExportFilters): Promise<{
    students: StudentResult[];
    analysis: {
      topPerformers: StudentResult[];
      needsImprovement: StudentResult[];
      subjectAnalysis: {
        subject: string;
        averageScore: number;
        highestScore: number;
        lowestScore: number;
        passRate: number;
      }[];
    }
  }> {
    const results = await this.fetchResultsData(filters);

    if (results.length === 0) {
      throw new NoDataError(
        'No student performance data found. Please ensure that results have been entered for the selected criteria.'
      );
    }

    // Get top 10 performers
    const topPerformers = results.slice(0, 10);

    // Get students needing improvement (average < 50)
    const needsImprovement = results.filter(s => s.average < 50).slice(0, 10);

    // Subject-wise analysis
    const subjectScores = new Map<string, number[]>();
    results.forEach(student => {
      student.subjects.forEach(subject => {
        const existing = subjectScores.get(subject.name) || [];
        existing.push(subject.total);
        subjectScores.set(subject.name, existing);
      });
    });

    const subjectAnalysis = Array.from(subjectScores.entries()).map(([subject, scores]) => ({
      subject,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) / 100,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate: Math.round((scores.filter(s => s >= 50).length / scores.length) * 100)
    }));

    return {
      students: results,
      analysis: {
        topPerformers,
        needsImprovement,
        subjectAnalysis
      }
    };
  }

  /**
   * Get performance remark based on average
   */
  static getPerformanceRemark(average: number): string {
    if (average >= 80) return 'Excellent';
    if (average >= 70) return 'Very Good';
    if (average >= 60) return 'Good';
    if (average >= 50) return 'Satisfactory';
    if (average >= 40) return 'Needs Improvement';
    return 'Poor';
  }

  /**
   * Export data to Excel with professional styling
   */
  static exportToExcel(
    data: (string | number | boolean | null | undefined)[][],
    sheetName: string,
    filename: string,
    options?: {
      title?: string;
      subtitle?: string;
      columnWidths?: number[];
    }
  ): void {
    const workbook = XLSX.utils.book_new();

    const allRows: (string | number | boolean | null | undefined)[][] = [];

    // Add title if provided
    if (options?.title) {
      allRows.push([options.title]);
      allRows.push(['']);
    }

    // Add subtitle if provided
    if (options?.subtitle) {
      allRows.push([options.subtitle]);
      allRows.push(['']);
    }

    // Add data rows
    allRows.push(...data);

    const worksheet = XLSX.utils.aoa_to_sheet(allRows);

    // Set column widths
    if (options?.columnWidths) {
      worksheet['!cols'] = options.columnWidths.map(w => ({ width: w }));
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
  }
}
