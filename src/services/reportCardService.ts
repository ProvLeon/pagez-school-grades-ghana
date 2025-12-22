import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportCardData {
  student: {
    id: string;
    full_name: string;
    student_id: string;
    class_name: string;
    department_name: string;
    photo_url?: string;
    no_on_roll?: string;
  };
  total_students_with_results: number;
  school: {
    name: string;
    logo_url?: string;
    location?: string;
    address_1?: string;
    motto?: string;
    headteacher_name?: string;
    headteacher_signature_url?: string;
    primary_color?: string;
    phone?: string;
  };
  academic: {
    term: string;
    academic_year: string;
    days_school_opened: number;
    days_present: number;
    days_absent: number;
    term_begin: string;
    term_ends: string;
    next_term_begin: string;
    overall_position?: string;
  };
  ca_configuration: {
    ca: number;
    exam: number;
  };
  subjects: Array<{
    subject_name: string;
    ca_score: number;
    exam_score: number;
    total_score: number;
    grade: string;
    position: number;
    teacher_remarks?: string;
  }>;
  behavior: {
    conduct?: string;
    attitude?: string;
    interest?: string;
    teachers_comment?: string;
    heads_remarks?: string;
  };
  grading_scale: Array<{
    grade: string;
    from_percentage: number;
    to_percentage: number;
    remark: string;
  }>;
}

export class ReportCardService {
  static async fetchReportCardData(resultId: string): Promise<ReportCardData | null> {
    try {
      // Fetch result with related data including proper subject information
      const { data: result, error: resultError } = await supabase
        .from('results')
        .select(`
          *,
          student:students(
            id,
            full_name,
            student_id,
            photo_url,
            no_on_roll,
            class:classes(name, department:departments(name))
          ),
          class:classes(name, department:departments(name)),
          ca_type:ca_types(
            name,
            configuration
          ),
          subject_marks(
            ca1_score,
            ca2_score,
            ca3_score,
            ca4_score,
            exam_score,
            total_score,
            grade,
            position,
            subject:subjects(id, name, code)
          )
        `)
        .eq('id', resultId)
        .single();

      if (resultError) throw resultError;
      if (!result) return null;

      // Calculate overall position for this student within their class
      const overallPosition = await this.calculateOverallPosition(result.id, result.class_id, result.academic_year, result.term);
      console.log('Calculated overall position for student:', result.student?.full_name, 'Position:', overallPosition);

      // Fetch school settings including address and motto
      const { data: schoolSettings } = await supabase
        .from('school_settings')
        .select('*')
        .maybeSingle();

      // Fetch grading scale for the department/term
      const { data: gradingScale } = await supabase
        .from('grading_scales')
        .select('*')
        .eq('academic_year', result.academic_year)
        .eq('term', result.term);

      // Fetch grading settings to get attendance_for_term
      const { data: gradingSettings } = await supabase
        .from('grading_settings')
        .select('attendance_for_term')
        .eq('academic_year', result.academic_year)
        .eq('term', result.term)
        .maybeSingle();

      // Count total students with results for the same term, academic year, and class
      const { count: totalStudentsWithResults } = await supabase
        .from('results')
        .select('student_id', { count: 'exact', head: true })
        .eq('academic_year', result.academic_year)
        .eq('term', result.term)
        .eq('class_id', result.class_id);

      // Process subject marks with proper subject names and calculated scores
      const subjects = result.subject_marks?.map((mark: any) => {
        const config = (result.ca_type?.configuration as any) || {};
        const clamp = (val: number | undefined, max: number) => {
          const n = typeof val === 'number' ? val : 0;
          if (Number.isNaN(n)) return 0;
          return Math.min(Math.max(n, 0), max);
        };

        let weightedCaScore = 0;
        if (config.ca) {
          const caRaw = clamp(mark.ca1_score, 100);
          weightedCaScore = Math.round((caRaw * (config.ca || 0)) / 100);
        } else {
          const parts = [
            { key: 'ca1_score' as const, max: config.ca1 || 0 },
            { key: 'ca2_score' as const, max: config.ca2 || 0 },
            { key: 'ca3_score' as const, max: config.ca3 || 0 },
            { key: 'ca4_score' as const, max: config.ca4 || 0 },
          ];
          const caSum = parts.reduce((sum, p) => sum + (p.max ? clamp((mark as any)[p.key], p.max) : 0), 0);
          weightedCaScore = Math.round(caSum);
        }

        const examPercentage = config.exam || 0;
        const weightedExamScore = Math.round((clamp(mark.exam_score, 100) * examPercentage) / 100);

        return {
          subject_name: mark.subject?.name || 'Unknown Subject',
          ca_score: weightedCaScore,
          exam_score: weightedExamScore,
          total_score: Math.round(mark.total_score || 0),
          grade: mark.grade || 'F',
          position: mark.position || 0,
          teacher_remarks: this.getRemarkForGrade(mark.grade, gradingScale || [])
        };
      }) || [];

      return {
        student: {
          id: result.student?.id || '',
          full_name: result.student?.full_name || '',
          student_id: result.student?.student_id || '',
          class_name: result.student?.class?.name || result.class?.name || '',
          department_name: result.student?.class?.department?.name || result.class?.department?.name || 'GENERAL',
          photo_url: result.student?.photo_url
        },
        total_students_with_results: totalStudentsWithResults || 0,
        school: {
          name: schoolSettings?.school_name || 'School Name',
          logo_url: schoolSettings?.logo_url,
          location: schoolSettings?.location,
          address_1: schoolSettings?.address_1,
          motto: schoolSettings?.motto,
          headteacher_name: schoolSettings?.headteacher_name,
          headteacher_signature_url: schoolSettings?.headteacher_signature_url,
          primary_color: schoolSettings?.primary_color,
          phone: schoolSettings?.phone
        },
        academic: {
          term: result.term,
          academic_year: result.academic_year,
          days_school_opened: gradingSettings?.attendance_for_term || 0,
          days_present: Math.max(0, (gradingSettings?.attendance_for_term || 0) - (result.days_absent || 0)),
          days_absent: result.days_absent || 0,
          term_begin: result.term_begin || '',
          term_ends: result.term_ends || '',
          next_term_begin: result.next_term_begin || '',
          overall_position: overallPosition
        },
        ca_configuration: {
          ca: (result.ca_type?.configuration as any)?.ca || 30,
          exam: (result.ca_type?.configuration as any)?.exam || 70
        },
        subjects,
        behavior: {
          conduct: result.conduct,
          attitude: result.attitude,
          interest: result.interest,
          teachers_comment: result.teachers_comment,
          heads_remarks: result.heads_remarks
        },
        grading_scale: gradingScale || []
      };
    } catch (error) {
      console.error('Error fetching report card data:', error);
      return null;
    }
  }

  // Helper method to calculate overall position within class
  private static async calculateOverallPosition(resultId: string, classId: string | null, academicYear: string, term: string): Promise<string> {
    try {
      if (!classId) {
        console.log('No class ID provided for position calculation');
        return '';
      }
      // Fetch all results for the same class, term, and academic year with their subject marks
      const { data: classResults, error } = await supabase
        .from('results')
        .select(`
          id,
          total_score,
          subject_marks(total_score)
        `)
        .eq('class_id', classId)
        .eq('academic_year', academicYear)
        .eq('term', term);

      if (error) {
        console.error('Error fetching class results:', error);
        throw error;
      }
      if (!classResults || classResults.length === 0) {
        console.log('No class results found for position calculation');
        return '';
      }

      // Calculate total scores for each student from their subject marks
      const studentsWithTotalScores = classResults.map(result => {
        // Use stored total_score if available, otherwise calculate from subject marks
        let calculatedTotal = result.total_score;

        if (!calculatedTotal && result.subject_marks && result.subject_marks.length > 0) {
          const subjectTotals = result.subject_marks
            .filter((mark: any) => mark.total_score !== null)
            .map((mark: any) => mark.total_score);

          if (subjectTotals.length > 0) {
            calculatedTotal = subjectTotals.reduce((sum: number, score: number) => sum + score, 0);
          }
        }

        return {
          id: result.id,
          totalScore: calculatedTotal || 0
        };
      }).filter(student => student.totalScore > 0);

      if (studentsWithTotalScores.length === 0) {
        console.log('No students with valid total scores found');
        return '';
      }

      console.log(`Found ${studentsWithTotalScores.length} students with scores for position calculation`);
      console.log('Students with scores:', studentsWithTotalScores);

      // Group students by score to handle ties
      const scoreGroups: { [score: number]: string[] } = {};
      studentsWithTotalScores.forEach(student => {
        const score = student.totalScore;
        if (!scoreGroups[score]) {
          scoreGroups[score] = [];
        }
        scoreGroups[score].push(student.id);
      });

      // Sort scores in descending order
      const sortedScores = Object.keys(scoreGroups)
        .map(score => parseFloat(score))
        .sort((a, b) => b - a);

      // Calculate position
      let currentPosition = 1;
      for (const score of sortedScores) {
        const studentsWithScore = scoreGroups[score];

        if (studentsWithScore.includes(resultId)) {
          const position = this.getOrdinalPosition(currentPosition);
          console.log(`Student ${resultId} position: ${position} (total score: ${score})`);
          return position;
        }

        // Skip positions for tied students
        currentPosition += studentsWithScore.length;
      }

      console.log(`Student ${resultId} not found in any position group`);
      return '';
    } catch (error) {
      console.error('Error calculating overall position:', error);
      return '';
    }
  }

  // Helper method to convert number to ordinal format (1st, 2nd, 3rd, etc.)
  private static getOrdinalPosition(position: number): string {
    if (position <= 0) return '';

    const lastDigit = position % 10;
    const lastTwoDigits = position % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${position}th`;
    }

    switch (lastDigit) {
      case 1: return `${position}st`;
      case 2: return `${position}nd`;
      case 3: return `${position}rd`;
      default: return `${position}th`;
    }
  }

  // Helper method to get remark based on grade
  private static getRemarkForGrade(grade: string, gradingScale: any[]): string {
    const scale = gradingScale.find(s => s.grade === grade);
    return scale?.remark || '';
  }

  // Helper method to convert image URL to base64
  private static async getImageAsBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  }

  // Helper method to add rounded border around an image
  private static addRoundedBorder(pdf: jsPDF, x: number, y: number, width: number, height: number, radius: number = 2) {
    const lineWidth = 0.5;
    pdf.setLineWidth(lineWidth);
    pdf.setDrawColor(0, 0, 0); // Black border

    // Since jsPDF doesn't have native rounded rectangle support,
    // we'll create a rounded effect using multiple line segments
    pdf.setLineCap('round');
    pdf.setLineJoin('round');

    // Draw rounded rectangle by creating small segments at corners
    const cornerOffset = Math.min(radius, width / 4, height / 4);

    // Top line (with rounded corners)
    pdf.line(x + cornerOffset, y, x + width - cornerOffset, y);
    // Top-right corner curve simulation with short lines
    pdf.line(x + width - cornerOffset, y, x + width, y + cornerOffset);
    // Right line
    pdf.line(x + width, y + cornerOffset, x + width, y + height - cornerOffset);
    // Bottom-right corner
    pdf.line(x + width, y + height - cornerOffset, x + width - cornerOffset, y + height);
    // Bottom line
    pdf.line(x + width - cornerOffset, y + height, x + cornerOffset, y + height);
    // Bottom-left corner
    pdf.line(x + cornerOffset, y + height, x, y + height - cornerOffset);
    // Left line
    pdf.line(x, y + height - cornerOffset, x, y + cornerOffset);
    // Top-left corner
    pdf.line(x, y + cornerOffset, x + cornerOffset, y);
  }

  // Helper methods for color management
  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 37, g: 99, b: 235 }; // Default blue
  }

  private static lightenColor(rgb: { r: number; g: number; b: number }, factor: number): { r: number; g: number; b: number } {
    return {
      r: Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor)),
      g: Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor)),
      b: Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor))
    };
  }

  private static getGradeColor(grade: string): { r: number; g: number; b: number } {
    switch (grade.toUpperCase()) {
      case 'A': return { r: 34, g: 197, b: 94 };   // Green
      case 'B': return { r: 59, g: 130, b: 246 };  // Blue
      case 'C': return { r: 234, g: 179, b: 8 };   // Yellow
      case 'D': return { r: 249, g: 115, b: 22 };  // Orange
      case 'E':
      case 'F': return { r: 239, g: 68, b: 68 };   // Red
      default: return { r: 156, g: 163, b: 175 }; // Gray
    }
  }

  static async generatePDF(data: ReportCardData): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    let currentY = margin;

    // Enhanced color scheme based on school primary color
    const primaryColor = data.school.primary_color || '#2563eb';
    const primaryRGB = this.hexToRgb(primaryColor);
    const lightPrimaryRGB = this.lightenColor(primaryRGB, 0.95);
    const headerColor = this.lightenColor(primaryRGB, 0.8);
    const accentColor = this.lightenColor(primaryRGB, 0.7);

    // Add professional gradient page border
    pdf.setDrawColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    pdf.setLineWidth(1.2);
    pdf.roundedRect(4, 4, pageWidth - 8, pageHeight - 8, 3, 3);

    // Inner shadow effect
    pdf.setDrawColor(this.lightenColor(primaryRGB, 0.3).r, this.lightenColor(primaryRGB, 0.3).g, this.lightenColor(primaryRGB, 0.3).b);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(5, 5, pageWidth - 10, pageHeight - 10, 2, 2);

    // Add decorative corner elements
    pdf.setFillColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    pdf.circle(10, 10, 2, 'F');
    pdf.circle(pageWidth - 10, 10, 2, 'F');
    pdf.circle(10, pageHeight - 10, 2, 'F');
    pdf.circle(pageWidth - 10, pageHeight - 10, 2, 'F');

    // Add school logo watermark with transparency effect
    try {
      if (data.school.logo_url) {
        const logoBase64 = await this.getImageAsBase64(data.school.logo_url);
        if (logoBase64) {
          // Save the current graphics state
          pdf.saveGraphicsState();

          // Set transparency for watermark effect
          pdf.setGState(pdf.GState({ opacity: 0.1 }));

          // Calculate watermark size and position (centered)
          const watermarkSize = Math.min(pageWidth, pageHeight) * 0.4;
          const watermarkX = (pageWidth - watermarkSize) / 2;
          const watermarkY = (pageHeight - watermarkSize) / 2;

          // Add logo as watermark
          pdf.addImage(logoBase64, 'JPEG', watermarkX, watermarkY, watermarkSize, watermarkSize);

          // Restore graphics state
          pdf.restoreGraphicsState();
        }
      }
    } catch (error) {
      console.error('Error adding logo watermark:', error);
    }

    // Reset text color to professional dark
    pdf.setTextColor(30, 30, 30);

    // === HEADER SECTION ===
    // School logo (top-left) - Bigger logo for better visibility
    try {
      if (data.school.logo_url) {
        const logoBase64 = await this.getImageAsBase64(data.school.logo_url);
        if (logoBase64) {
          pdf.addImage(logoBase64, 'JPEG', 15, currentY, 20, 20);
        } else {
          this.addLogoPlaceholder(pdf, 15, currentY, 20, 20);
        }
      } else {
        this.addLogoPlaceholder(pdf, 15, currentY, 20, 20);
      }
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
      this.addLogoPlaceholder(pdf, 15, currentY, 20, 20);
    }

    // Student photo (top-right) - Bigger photo for better visibility
    try {
      if (data.student.photo_url) {
        const photoBase64 = await this.getImageAsBase64(data.student.photo_url);
        if (photoBase64) {
          pdf.addImage(photoBase64, 'JPEG', 175, currentY, 20, 25);
          this.addRoundedBorder(pdf, 175, currentY, 20, 25, 2);
        } else {
          this.addPhotoPlaceholder(pdf, 175, currentY, 20, 25);
          this.addRoundedBorder(pdf, 175, currentY, 20, 25, 2);
        }
      } else {
        this.addPhotoPlaceholder(pdf, 175, currentY, 20, 25);
        this.addRoundedBorder(pdf, 175, currentY, 20, 25, 2);
      }
    } catch (error) {
      console.error('Error adding student photo to PDF:', error);
      this.addPhotoPlaceholder(pdf, 175, currentY, 20, 25);
      this.addRoundedBorder(pdf, 175, currentY, 20, 25, 2);
    }

    // Header text - Professional typography with clear hierarchy
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    let headerY = currentY + 5;

    // School name at the top
    const schoolText = data.school.name.toUpperCase();
    const schoolWidth = pdf.getTextWidth(schoolText);
    pdf.text(schoolText, (210 - schoolWidth) / 2, headerY);
    headerY += 6;

    // Report sheet description
    pdf.setFontSize(12);
    const reportText = `STUDENT'S REPORT SHEET (${data.student.department_name.toUpperCase()} DEPARTMENT)`;
    const reportWidth = pdf.getTextWidth(reportText);
    pdf.text(reportText, (210 - reportWidth) / 2, headerY);
    headerY += 5;

    // Location (if available)
    if (data.school.location) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const locationText = `Location: ${data.school.location}`;
      const locationWidth = pdf.getTextWidth(locationText);
      pdf.text(locationText, (210 - locationWidth) / 2, headerY);
      headerY += 4;
    }

    // Address (if available)
    if (data.school.address_1) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const addressText = `Address: ${data.school.address_1}`;
      const addressWidth = pdf.getTextWidth(addressText);
      pdf.text(addressText, (210 - addressWidth) / 2, headerY);
    }

    currentY += 25; // Reduced from 35

    // === STUDENT INFORMATION SECTION ===
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const leftX = 15;
    const rightX = 110;
    const fieldSpacing = 7;

    // Add small gap before student information
    currentY += 3;

    // Get school's primary color for accent lines
    const schoolColor = this.hexToRgb(data.school.primary_color || '#e11d48');

    // Helper function to draw clean minimalist line
    const drawCleanLine = (x: number, y: number, width: number, text?: string) => {
      const lineY = y + 1.5; // Position line below text

      // Draw clean line in school's primary color
      pdf.setDrawColor(schoolColor.r, schoolColor.g, schoolColor.b);
      pdf.setLineWidth(0.3);
      pdf.line(x, lineY, x + width, lineY);

      // Add text if provided
      if (text) {
        pdf.setTextColor(0, 0, 0);
        pdf.text(text, x + 1, y);
      }
    };

    // Left column
    pdf.setFont('helvetica', 'bold');
    pdf.text("STUDENT'S NAME:", leftX, currentY);
    pdf.setFont('helvetica', 'normal');
    drawCleanLine(leftX + 36, currentY, 50, data.student.full_name);

    pdf.setFont('helvetica', 'bold');
    pdf.text("CLASS:", rightX, currentY);
    pdf.setFont('helvetica', 'normal');
    drawCleanLine(rightX + 16, currentY, 50, data.student.class_name);

    currentY += fieldSpacing;

    pdf.setFont('helvetica', 'bold');
    pdf.text("ACADEMIC YEAR:", leftX, currentY);
    pdf.setFont('helvetica', 'normal');
    drawCleanLine(leftX + 36, currentY, 50, data.academic.academic_year);

    pdf.setFont('helvetica', 'bold');
    pdf.text("TERM:", rightX, currentY);
    pdf.setFont('helvetica', 'normal');
    const termText = `${data.academic.term.charAt(0).toUpperCase() + data.academic.term.slice(1)} Term`;
    drawCleanLine(rightX + 16, currentY, 50, termText);

    currentY += fieldSpacing;

    pdf.setFont('helvetica', 'bold');
    pdf.text("No. ON ROLL:", leftX, currentY);
    pdf.setFont('helvetica', 'normal');
    drawCleanLine(leftX + 26, currentY, 60, data.total_students_with_results.toString());

    pdf.setFont('helvetica', 'bold');
    pdf.text("DATE:", rightX, currentY);
    pdf.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('en-GB');
    drawCleanLine(rightX + 16, currentY, 50, today);

    currentY += fieldSpacing;

    pdf.setFont('helvetica', 'bold');
    pdf.text("OVERALL POSITION:", leftX, currentY);
    pdf.setFont('helvetica', 'normal');
    const positionText = data.academic.overall_position || '';
    drawCleanLine(leftX + 36, currentY, 50, positionText);

    pdf.setFont('helvetica', 'bold');
    pdf.text("NEXT TERM BEGINS:", rightX, currentY);
    pdf.setFont('helvetica', 'normal');
    const nextTermText = data.academic.next_term_begin
      ? new Date(data.academic.next_term_begin).toLocaleDateString('en-GB')
      : '';
    drawCleanLine(rightX + 41, currentY, 45, nextTermText);

    currentY += 10; // Reduced spacing

    // === SUBJECTS TABLE ===
    const headers = [
      'SUBJECT',
      `CLASS SCORE (${data.ca_configuration.ca}%)`,
      `EXAMS SCORE (${data.ca_configuration.exam}%)`,
      'TOTAL SCORE (100%)',
      'GRADE',
      'REMARKS'
    ];

    const tableData = data.subjects.map(subject => [
      subject.subject_name,
      subject.ca_score.toString(),
      subject.exam_score.toString(),
      subject.total_score.toString(),
      subject.grade,
      subject.teacher_remarks || this.getRemarkForGrade(subject.grade, data.grading_scale)
    ]);

    // Add empty rows to make 10 total (reduced from 12 for better fit)
    while (tableData.length < 10) {
      tableData.push(['', '', '', '', '', '']);
    }

    // Calculate margins to center the table (total column width is 170mm)
    const tableWidth = 170; // Sum of all column widths
    const centerMargin = (pageWidth - tableWidth) / 2;

    autoTable(pdf, {
      head: [headers],
      body: tableData,
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [180, 180, 180],
        lineWidth: 0.3,
        valign: 'middle',
        halign: 'center',
        textColor: [40, 40, 40]
      },
      headStyles: {
        fillColor: [primaryRGB.r, primaryRGB.g, primaryRGB.b],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        lineWidth: 0.5,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'left', fontStyle: 'bold' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 40, halign: 'left', fontSize: 8 }
      },
      alternateRowStyles: {
        fillColor: [lightPrimaryRGB.r, lightPrimaryRGB.g, lightPrimaryRGB.b]
      },
      didParseCell: function (data: any) {
        // No color coding for grades or scores
      },
      margin: { left: centerMargin, right: centerMargin }
    });

    currentY = (pdf as any).lastAutoTable.finalY + 6; // Reduced spacing

    // === SUMMARY SECTION ===
    // Create attractive summary cards
    pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b);
    pdf.roundedRect(centerMargin, currentY, 80, 12, 2, 2, 'F');
    pdf.roundedRect(centerMargin + 95, currentY, 75, 12, 2, 2, 'F');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    pdf.text("ATTENDANCE", centerMargin + 5, currentY + 4);

    // Attendance progress bar
    const attendancePercentage = (data.academic.days_present / data.academic.days_school_opened) * 100;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);
    pdf.text(`${data.academic.days_present} OUT OF ${data.academic.days_school_opened}`, centerMargin + 5, currentY + 8);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    pdf.text("PROMOTED TO:", centerMargin + 100, currentY + 4);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    drawCleanLine(centerMargin + 100, currentY + 8, 65);

    currentY += 18;

    // === BEHAVIORAL SECTION ===
    // Section header with background
    pdf.setFillColor(240, 240, 240);
    pdf.rect(centerMargin, currentY - 2, 170, 6, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text("BEHAVIORAL ASSESSMENT", centerMargin + 2, currentY + 1);
    currentY += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text("CONDUCT:", centerMargin, currentY);
    pdf.setFont('helvetica', 'normal');
    drawCleanLine(centerMargin + 21, currentY, 145, data.behavior.conduct);

    currentY += fieldSpacing;

    pdf.setFont('helvetica', 'bold');
    pdf.text("ATTITUDE:", centerMargin, currentY);
    pdf.setFont('helvetica', 'normal');
    drawCleanLine(centerMargin + 21, currentY, 145, data.behavior.attitude);

    currentY += fieldSpacing;

    pdf.setFont('helvetica', 'bold');
    pdf.text("INTEREST:", centerMargin, currentY);
    pdf.setFont('helvetica', 'normal');
    drawCleanLine(centerMargin + 21, currentY, 145, data.behavior.interest);

    currentY += 8; // Reduced spacing

    // === COMMENTS SECTION ===
    currentY += 2;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text("CLASS TEACHER'S REMARKS:", centerMargin, currentY);

    if (data.behavior.teachers_comment) {
      pdf.setFont('helvetica', 'normal');
      const splitComment = pdf.splitTextToSize(data.behavior.teachers_comment, 110);
      pdf.text(splitComment, centerMargin + 50, currentY);
    }

    currentY += 10; // Reduced spacing

    // === HEAD TEACHER'S REMARKS ===
    currentY += 2;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text("HEAD TEACHER'S REMARKS:", centerMargin, currentY);

    let headRemarksHeight = 4; // Default height if no remarks
    if (data.behavior.heads_remarks) {
      pdf.setFont('helvetica', 'normal');
      const splitHeadRemarks = pdf.splitTextToSize(data.behavior.heads_remarks, 110);
      pdf.text(splitHeadRemarks, centerMargin + 50, currentY);
      // Calculate actual height of remarks (approximately 4mm per line)
      headRemarksHeight = splitHeadRemarks.length * 4;
    }

    // Move past the head remarks text before rendering headteacher section
    currentY += Math.max(headRemarksHeight, 8) + 6;

    // === HEADTEACHER SECTION ===

    // Center the headteacher section
    const centerX = centerMargin + 85; // Center of the page width (170/2)

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text("HEADTEACHER:", centerX, currentY, { align: 'center' });
    currentY += 5;

    if (data.school.headteacher_name) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.school.headteacher_name, centerX, currentY, { align: 'center' });
    }

    currentY += 4; // Space between name and signature

    // Add signature image if available
    if (data.school.headteacher_signature_url) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const imgWidth = 40;
          const imgHeight = 15;
          const imgX = centerX - imgWidth / 2;
          pdf.addImage(img, 'PNG', imgX, currentY, imgWidth, imgHeight);
        };
        img.src = data.school.headteacher_signature_url;

        // Wait for image to load
        await new Promise(resolve => {
          img.onload = () => {
            const imgWidth = 40;
            const imgHeight = 15;
            const imgX = centerX - imgWidth / 2;
            pdf.addImage(img, 'PNG', imgX, currentY, imgWidth, imgHeight);
            resolve(true);
          };
          img.onerror = () => resolve(false);
        });
        currentY += 16; // Account for image height
      } catch (error) {
        console.error('Error loading signature image:', error);
        // Fallback to signature line
        pdf.setLineWidth(0.5);
        pdf.line(centerX - 30, currentY + 4, centerX + 30, currentY + 4);
        currentY += 8;
      }
    } else {
      // No signature image, show signature line
      pdf.setLineWidth(0.5);
      pdf.line(centerX - 30, currentY + 4, centerX + 30, currentY + 4);
      currentY += 8;
    }

    pdf.setFontSize(8);
    const generatedDate = new Date().toLocaleDateString('en-GB');
    pdf.text(generatedDate, centerX, currentY + 2, { align: 'center' });

    // Add school motto at bottom left corner
    if (data.school.motto) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      const mottoText = `School Motto: ${data.school.motto}`;
      pdf.text(mottoText, margin + 15, pageHeight - margin, { align: 'left' });
    }

    // Add school phone number at bottom right corner
    if (data.school.phone) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      const contactText = `Contact: ${data.school.phone}`;
      pdf.text(contactText, pageWidth - margin - 15, pageHeight - margin, { align: 'right' });
    }

    return pdf.output('blob');
  }

  // Helper methods for placeholders
  private static addLogoPlaceholder(pdf: any, x: number, y: number, w: number, h: number) {
    pdf.setFillColor(240, 240, 240);
    pdf.rect(x, y, w, h, 'F');
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(x, y, w, h);
    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
    pdf.text('LOGO', x + w / 2, y + h / 2, { align: 'center' });
  }

  private static addPhotoPlaceholder(pdf: any, x: number, y: number, w: number, h: number) {
    pdf.setFillColor(240, 240, 240);
    pdf.rect(x, y, w, h, 'F');
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(x, y, w, h);
    pdf.setFontSize(5);
    pdf.setTextColor(100, 100, 100);
    pdf.text('STUDENT', x + w / 2, y + h / 2 - 1, { align: 'center' });
    pdf.text('PHOTO', x + w / 2, y + h / 2 + 2, { align: 'center' });
  }

  static async generateBulkReports(studentIds: string[], term: string, academicYear: string): Promise<Blob[]> {
    const reports: Blob[] = [];

    for (const studentId of studentIds) {
      // Find result for this student
      const { data: result } = await supabase
        .from('results')
        .select('id')
        .eq('student_id', studentId)
        .eq('term', term)
        .eq('academic_year', academicYear)
        .maybeSingle();

      if (result) {
        const reportData = await this.fetchReportCardData(result.id);
        if (reportData) {
          const pdfBlob = await this.generatePDF(reportData);
          reports.push(pdfBlob);
        }
      }
    }

    return reports;
  }

  static downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
