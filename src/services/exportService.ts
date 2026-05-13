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
  heads_remarks?: string;
  next_term_begin?: string;
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
        remark: mark.subject_teacher_remarks || mark.remark || ''
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
        heads_remarks: result.heads_remarks || undefined,
        next_term_begin: result.next_term_begin || undefined,
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
    const XLSX = (await import('xlsx-js-style')).default;
    const results = await this.fetchResultsData(filters);

    if (results.length === 0) {
      throw new NoDataError(
        'No results found for the selected filters. Please ensure that results have been entered for the selected term, academic year, and class/department.'
      );
    }

    const className    = results[0]?.class_name    || 'All Classes';
    const deptName     = results[0]?.department_name || '';
    const termLabel    = filters.term;
    const academicYear = filters.academicYear;

    // Unique ordered subject list
    const allSubjects = new Map<string, string>();
    results.forEach(s => s.subjects.forEach(sub => allSubjects.set(sub.code || sub.name, sub.name)));
    const subjectList = Array.from(allSubjects.entries()); // [code, name][]

    // ── Colour palette ──────────────────────────────────────────────────────
    const C = {
      titleBg:   'FF0D1B4A',  // deep navy
      titleFg:   'FFFFFFFF',
      headerBg:  'FF1565C0',  // brand blue
      headerFg:  'FFFFFFFF',
      subBg:     'FFE3F2FD',  // light blue for subject cols
      subFg:     'FF0D47A1',
      altRow:    'FFF5F8FF',
      white:     'FFFFFFFF',
      border:    'FFB0BEC5',
      summBg:    'FFF1F8E9',
      summLabel: 'FF1B5E20',
    };

    const border = (c: string) => ({ style: 'thin', color: { rgb: c } });
    const borders = { top: border(C.border), bottom: border(C.border), left: border(C.border), right: border(C.border) };

    const mkCell = (v: string | number, s: Record<string, unknown>) => ({ v, s });

    // Helper: column letter from 0-based index
    const colLetter = (i: number) => {
      let l = '';
      for (let n = i; n >= 0; n = Math.floor(n / 26) - 1)
        l = String.fromCharCode((n % 26) + 65) + l;
      return l;
    };

    const ws: Record<string, unknown> = {};
    const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [];
    let R = 0; // current row (0-based)

    const totalCols = 3 + subjectList.length + 5 + 2; // Pos+ID+Name + subjects + Total+Avg+Grade+Present+Absent + Remarks+NextTerm

    // ── Row 0: Main title ────────────────────────────────────────────────────
    const titleStyle = {
      font: { bold: true, sz: 14, color: { rgb: C.titleFg }, name: 'Calibri' },
      fill: { fgColor: { rgb: C.titleBg }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borders,
    };
    ws[`A${R + 1}`] = mkCell('CLASS BROADSHEET', titleStyle);
    merges.push({ s: { r: R, c: 0 }, e: { r: R, c: totalCols - 1 } });
    R++;

    // ── Row 1: Meta info ──────────────────────────────────────────────────────
    const metaStyle = {
      font: { bold: false, sz: 10, color: { rgb: C.titleFg }, name: 'Calibri' },
      fill: { fgColor: { rgb: C.titleBg }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borders,
    };
    const metaText = `${className}${deptName ? ` · ${deptName}` : ''} | ${termLabel} | ${academicYear} | Generated: ${new Date().toLocaleDateString('en-GB')}`;
    ws[`A${R + 1}`] = mkCell(metaText, metaStyle);
    merges.push({ s: { r: R, c: 0 }, e: { r: R, c: totalCols - 1 } });
    R++;

    // ── Blank row ────────────────────────────────────────────────────────────
    R++;

    // ── Header row ───────────────────────────────────────────────────────────
    const hBase = {
      font: { bold: true, sz: 10, color: { rgb: C.headerFg }, name: 'Calibri' },
      fill: { fgColor: { rgb: C.headerBg }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: borders,
    };
    const hSubject = {
      ...hBase,
      fill: { fgColor: { rgb: C.subBg }, patternType: 'solid' },
      font: { ...hBase.font, color: { rgb: C.subFg } },
    };

    const headers = [
      'Pos', 'Student ID', 'Student Name',
      ...subjectList.map(([, n]) => n),
      'Total', 'Avg', 'Grade', 'Days Present', 'Days Absent',
      "Head's Remarks", 'Next Term Begins',
    ];
    headers.forEach((h, ci) => {
      const isSubject = ci >= 3 && ci < 3 + subjectList.length;
      ws[`${colLetter(ci)}${R + 1}`] = mkCell(h, isSubject ? hSubject : hBase);
    });
    R++;

    // ── Data rows ─────────────────────────────────────────────────────────────
    results.forEach((student, rowIdx) => {
      const isAlt = rowIdx % 2 === 1;
      const cellStyle = {
        font: { sz: 10, name: 'Calibri' },
        fill: { fgColor: { rgb: isAlt ? C.altRow : C.white }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: borders,
      };
      const nameStyle = { ...cellStyle, alignment: { horizontal: 'left', vertical: 'center' } };

      const row: (string | number)[] = [
        student.position,
        student.student_id,
        student.student_name,
        ...subjectList.map(([code, name]) => {
          const sub = student.subjects.find(s => (s.code || s.name) === code || s.name === name);
          return sub ? sub.total : '';
        }),
        student.total_score,
        student.average,
        student.grade,
        student.days_present,
        student.days_absent,
        student.heads_remarks || '',
        student.next_term_begin || '',
      ];

      row.forEach((val, ci) => {
        ws[`${colLetter(ci)}${R + 1}`] = mkCell(
          val as string | number,
          ci === 2 ? nameStyle : cellStyle
        );
      });
      R++;
    });

    // ── Summary rows ─────────────────────────────────────────────────────────
    R++;
    const summLabelStyle = {
      font: { bold: true, sz: 10, color: { rgb: C.summLabel }, name: 'Calibri' },
      fill: { fgColor: { rgb: C.summBg }, patternType: 'solid' },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: borders,
    };
    const summValStyle = {
      font: { bold: false, sz: 10, name: 'Calibri' },
      fill: { fgColor: { rgb: C.summBg }, patternType: 'solid' },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: borders,
    };
    const classAvg = Math.round(results.reduce((s, r) => s + r.average, 0) / results.length * 100) / 100;
    const summaries: [string, string | number][] = [
      ['Total Students', results.length],
      ['Class Average', classAvg],
      ['Highest Avg', Math.max(...results.map(r => r.average))],
      ['Lowest Avg', Math.min(...results.map(r => r.average))],
      ['Pass Rate (≥50%)', `${Math.round((results.filter(r => r.average >= 50).length / results.length) * 100)}%`],
    ];
    summaries.forEach(([label, val]) => {
      ws[`A${R + 1}`] = mkCell(label, summLabelStyle);
      ws[`B${R + 1}`] = mkCell(val as string | number, summValStyle);
      R++;
    });

    // ── Sheet metadata ────────────────────────────────────────────────────────
    ws['!ref'] = `A1:${colLetter(totalCols - 1)}${R + 1}`;
    ws['!merges'] = merges;
    ws['!rows'] = [
      { hpt: 28 }, // title
      { hpt: 20 }, // meta
      { hpt: 6  }, // blank
      { hpt: 36 }, // header (tall for wrap)
    ];
    ws['!cols'] = [
      { width: 5  },  // Pos
      { width: 13 },  // Student ID
      { width: 26 },  // Student Name
      ...subjectList.map(() => ({ width: 11 })),
      { width: 8  },  // Total
      { width: 8  },  // Avg
      { width: 7  },  // Grade
      { width: 13 },  // Days Present
      { width: 12 },  // Days Absent
      { width: 32 },  // Head's Remarks
      { width: 20 },  // Next Term Begins
    ];
    ws['!freeze'] = { xSplit: 3, ySplit: 4 }; // freeze first 3 cols + 4 header rows

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws as import('xlsx').WorkSheet, 'Broadsheet');

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Class_Broadsheet_${className.replace(/\s+/g, '_')}_${termLabel.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Generate Position Rankings Excel file
   */
  static async generatePositionRankings(filters: ExportFilters): Promise<void> {
    const XLSX = await import('xlsx');
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
  static async exportToExcel(
    data: (string | number | boolean | null | undefined)[][],
    sheetName: string,
    filename: string,
    options?: {
      title?: string;
      subtitle?: string;
      columnWidths?: number[];
    }
  ): Promise<void> {
    const XLSX = await import('xlsx');
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
