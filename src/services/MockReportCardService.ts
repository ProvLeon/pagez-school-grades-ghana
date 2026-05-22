import { supabase } from '@/lib/supabase';

export interface MockSubjectScore {
  subjectName: string;
  totalScore: number | null;
}

export interface MockPDFData {
  studentName: string;
  sessionName: string;
  academicYear: string;
  schoolSettings: {
    primary_color?: string;
    logo_url?: string;
    school_name?: string;
    headteacher_signature_url?: string;
  } | null;
  subjectScores: MockSubjectScore[];
}

// Helper to convert image URL to base64 for PDF
export const getImageAsBase64 = async (url: string): Promise<string | null> => {
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
};

// Helper methods for color management
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }; // Default black
};

export class MockReportCardService {
  static async generateIndividualPDF(data: MockPDFData): Promise<Blob> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;

    const primaryColorHex = data.schoolSettings?.primary_color || '#000000';
    const primaryRGB = hexToRgb(primaryColorHex);
    // Use primary color for borders to respect school theme while maintaining formal look
    const borderColor: [number, number, number] = [primaryRGB.r, primaryRGB.g, primaryRGB.b];

    let currentY = 15;

    // 1. Draw Page Border (Double line)
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(1.5);
    doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

    doc.setLineWidth(0.4);
    doc.rect(margin + 2, margin + 2, pageWidth - (margin * 2) - 4, pageHeight - (margin * 2) - 4);

    // 2. Header Section
    currentY = margin + 8;

    if (data.schoolSettings?.logo_url) {
      const logoBase64 = await getImageAsBase64(data.schoolSettings.logo_url);
      if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', margin + 6, currentY, 22, 22);
      }
    }

    doc.setTextColor(0, 0, 0);
    const schoolNameText = (data.schoolSettings?.school_name || "SCHOOL NAME").toUpperCase();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolNameText, pageWidth / 2, currentY + 8, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`(${data.sessionName.toUpperCase()}) MOCK RESULTS`, pageWidth / 2, currentY + 16, { align: 'center' });

    currentY += 30;

    // 3. Student Info Grid
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);

    doc.line(margin + 2, currentY, pageWidth - margin - 2, currentY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.text(`NAME: `, margin + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.studentName}`, margin + 20, currentY + 5);

    doc.line(pageWidth / 2, currentY, pageWidth / 2, currentY + 21);

    doc.setFont('helvetica', 'normal');
    doc.text(`MOCK: `, (pageWidth / 2) + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.sessionName}`, (pageWidth / 2) + 18, currentY + 5);

    currentY += 7;
    doc.line(margin + 2, currentY, pageWidth - margin - 2, currentY);

    doc.setFont('helvetica', 'normal');
    doc.text(`YEAR: `, margin + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.academicYear}`, margin + 18, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(`DATE: `, (pageWidth / 2) + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    const today = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    doc.text(`${today.toUpperCase()}`, (pageWidth / 2) + 18, currentY + 5);

    currentY += 7;
    doc.line(margin + 2, currentY, pageWidth - margin - 2, currentY);

    // Calculate Raw Score and Aggregate
    let aggregateStr = '-';
    let rawScoreStr = '-';

    if (data.subjectScores && data.subjectScores.length > 0) {
      const coreSubjects = ['english language', 'mathematics', 'science', 'social studies'];

      let coreScoreSum = 0;
      let coreGradesSum = 0;
      let coreSubjectCount = 0;

      const otherGrades: number[] = [];

      const getGrade = (score: number | null | undefined): number => {
        if (score === null || score === undefined) return 9;
        if (score >= 90) return 1;  // A+
        if (score >= 80) return 2;  // A
        if (score >= 70) return 3;  // B+
        if (score >= 60) return 4;  // B
        if (score >= 55) return 5;  // C+
        if (score >= 50) return 6;  // C
        if (score >= 40) return 7;  // D+
        if (score >= 35) return 8;  // E
        return 9;                   // F
      };

      data.subjectScores.forEach(s => {
        const subName = s.subjectName.toLowerCase();
        const score = Number(s.totalScore || 0);
        const grade = getGrade(score);

        const isCore = coreSubjects.some(core => subName.includes(core) || core.includes(subName));

        if (isCore) {
          coreScoreSum += score;
          coreGradesSum += grade;
          coreSubjectCount++;
        } else {
          otherGrades.push(grade);
        }
      });

      if (coreSubjectCount > 0) {
        rawScoreStr = coreScoreSum.toString();
      }

      if (coreSubjectCount > 0) {
        const sortedOtherGrades = otherGrades.sort((a, b) => a - b);
        const bestTwoOtherGradesSum = (sortedOtherGrades[0] || 0) + (sortedOtherGrades[1] || 0);
        const totalAggregate = coreGradesSum + bestTwoOtherGradesSum;
        aggregateStr = totalAggregate.toString();
      }
    }

    doc.setFont('helvetica', 'normal');
    doc.text(`AGGREGATE: `, margin + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${aggregateStr}`, margin + 30, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(`RAW SCORE: `, (pageWidth / 2) + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${rawScoreStr}`, (pageWidth / 2) + 30, currentY + 5);

    currentY += 7;
    doc.line(margin + 2, currentY, pageWidth - margin - 2, currentY);

    doc.setFillColor(235, 235, 235);
    doc.rect(margin + 2.1, currentY + 0.1, pageWidth - (margin * 2) - 4.2, 5.8, 'F');
    doc.line(pageWidth / 2, currentY, pageWidth / 2, currentY + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(50, 50, 50);
    doc.text(`NB: Core Subjects Plus Two Best Subjects = Aggregate`, margin + 4, currentY + 4);
    doc.text(`Total Raw Score`, (pageWidth / 2) + 4, currentY + 4);

    currentY += 6;
    doc.line(margin + 2, currentY, pageWidth - margin - 2, currentY);

    currentY += 6;

    // 4. Subjects Table
    if (data.subjectScores && data.subjectScores.length > 0) {
      const getMockNumericGrade = (score: number): number => {
        if (score >= 90) return 1;  // A+
        if (score >= 80) return 2;  // A
        if (score >= 70) return 3;  // B+
        if (score >= 60) return 4;  // B
        if (score >= 55) return 5;  // C+
        if (score >= 50) return 6;  // C
        if (score >= 40) return 7;  // D+
        if (score >= 35) return 8;  // E
        return 9;                   // F
      };

      const getGradeForScore = (score: number | null | undefined): string => {
        if (score === null || score === undefined) return '-';
        return getMockNumericGrade(score).toString();
      };

      const getRemarkForScore = (score: number | null | undefined): string => {
        if (score === null || score === undefined) return '';
        switch (getMockNumericGrade(score)) {
          case 1: return 'Highest';
          case 2: return 'Higher';
          case 3: return 'High';
          case 4: return 'High Average';
          case 5: return 'Average';
          case 6: return 'Low Average';
          case 7: return 'Low';
          case 8: return 'Lower';
          case 9: return 'Lowest';
          default: return '';
        }
      };

      const normalizeSubjectName = (name: string): string => {
        const lower = name.toLowerCase().replace(/[^a-z]/g, '');
        if (
          lower === 'ict' ||
          lower === 'ictcomputing' ||
          lower === 'ictandcomputing' ||
          lower === 'informationcommunicationstechnology' ||
          lower === 'informationtechnology' ||
          lower.startsWith('ict')
        ) {
          return 'COMPUTING';
        }
        return name.toUpperCase();
      };

      const subjectTableHeaders = ['SUBJECT', 'SCORE\n(100 %)', 'GRADE IN\nSUBJECT', 'REMARKS'];

      const subjectTableBody = data.subjectScores.map((s) => [
        normalizeSubjectName(s.subjectName),
        s.totalScore ?? '-',
        getGradeForScore(Number(s.totalScore)),
        getRemarkForScore(Number(s.totalScore)).toUpperCase(),
      ]);

      while (subjectTableBody.length < 9) {
        subjectTableBody.push(['', '', '', '']);
      }

      autoTable(doc, {
        startY: currentY,
        head: [subjectTableHeaders],
        body: subjectTableBody,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 4,
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.2,
          lineColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 65, halign: 'left' },
          1: { cellWidth: 25, halign: 'center', valign: 'middle' },
          2: { cellWidth: 25, halign: 'center', valign: 'middle' },
          3: { cellWidth: 67, halign: 'left', valign: 'middle' }
        },
        margin: { left: margin + 2, right: margin + 2 },
      });

      currentY = (doc as any).lastAutoTable?.finalY + 12 || currentY + 100;
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No subject scores available', margin + 5, currentY + 10);
      currentY += 20;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    currentY += 8;
    doc.text(`Class Teacher's Remarks`, margin + 6, currentY);
    doc.setLineDashPattern([1, 2], 0);
    doc.line(margin + 48, currentY, pageWidth - margin - 6, currentY);
    doc.setLineDashPattern([], 0);

    currentY += 10;
    doc.setLineDashPattern([1, 2], 0);
    doc.line(margin + 6, currentY, pageWidth - margin - 6, currentY);
    currentY += 10;
    doc.line(margin + 6, currentY, pageWidth - margin - 6, currentY);

    currentY += 15;
    doc.setLineDashPattern([], 0);
    doc.text(`Headteacher's Signature`, margin + 6, currentY);
    doc.setLineDashPattern([1, 2], 0);

    if (data.schoolSettings?.headteacher_signature_url) {
      const signatureBase64 = await getImageAsBase64(data.schoolSettings.headteacher_signature_url);
      if (signatureBase64) {
        doc.addImage(signatureBase64, 'PNG', margin + 48, currentY - 12, 40, 15);
      }
    }

    doc.line(margin + 48, currentY, pageWidth - margin - 6, currentY);
    doc.setLineDashPattern([], 0);

    return doc.output('blob');
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
