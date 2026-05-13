
import type { WorkSheet } from 'xlsx';

export interface TemplateColumn {
  header: string;
  key: string;
  width?: number;
  validation?: {
    type: 'list' | 'date' | 'number' | 'text';
    options?: string[];
    format?: string;
  };
  example?: string;
  required?: boolean;
}

// Professional color scheme
const COLORS = {
  primary: 'FF1565C0',        // Primary blue
  primaryLight: 'FFE3F2FD',   // Light blue bg
  required: 'FFFFF3E0',       // Light orange for required
  optional: 'FFF5F5F5',       // Light grey for optional
  header: 'FF1565C0',         // Header blue
  headerText: 'FFFFFFFF',     // White text
  example: 'FF757575',        // Grey for examples
  border: 'FFE0E0E0',         // Light grey border
  success: 'FFE8F5E9',        // Light green
  white: 'FFFFFFFF',
  alternateRow: 'FFFAFAFA',
};

// Common cell styles
const styles = {
  headerCell: {
    font: { bold: true, color: { rgb: COLORS.headerText }, sz: 11, name: 'Calibri' },
    fill: { fgColor: { rgb: COLORS.header }, patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: COLORS.border } },
      bottom: { style: 'thin', color: { rgb: COLORS.border } },
      left: { style: 'thin', color: { rgb: COLORS.border } },
      right: { style: 'thin', color: { rgb: COLORS.border } },
    },
  },
  requiredHeader: {
    font: { bold: true, color: { rgb: COLORS.headerText }, sz: 11, name: 'Calibri' },
    fill: { fgColor: { rgb: 'FFD84315' }, patternType: 'solid' }, // Orange for required
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: COLORS.border } },
      bottom: { style: 'thin', color: { rgb: COLORS.border } },
      left: { style: 'thin', color: { rgb: COLORS.border } },
      right: { style: 'thin', color: { rgb: COLORS.border } },
    },
  },
  exampleCell: {
    font: { italic: true, color: { rgb: COLORS.example }, sz: 10, name: 'Calibri' },
    fill: { fgColor: { rgb: COLORS.success }, patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: COLORS.border } },
      bottom: { style: 'thin', color: { rgb: COLORS.border } },
      left: { style: 'thin', color: { rgb: COLORS.border } },
      right: { style: 'thin', color: { rgb: COLORS.border } },
    },
  },
  dataCell: {
    font: { sz: 10, name: 'Calibri' },
    fill: { fgColor: { rgb: COLORS.white }, patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: COLORS.border } },
      bottom: { style: 'thin', color: { rgb: COLORS.border } },
      left: { style: 'thin', color: { rgb: COLORS.border } },
      right: { style: 'thin', color: { rgb: COLORS.border } },
    },
  },
  alternateCell: {
    font: { sz: 10, name: 'Calibri' },
    fill: { fgColor: { rgb: COLORS.alternateRow }, patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: COLORS.border } },
      bottom: { style: 'thin', color: { rgb: COLORS.border } },
      left: { style: 'thin', color: { rgb: COLORS.border } },
      right: { style: 'thin', color: { rgb: COLORS.border } },
    },
  },
  instructionTitle: {
    font: { bold: true, sz: 14, name: 'Calibri', color: { rgb: COLORS.primary } },
    alignment: { horizontal: 'left' },
  },
  instructionHeader: {
    font: { bold: true, sz: 11, name: 'Calibri' },
    alignment: { horizontal: 'left' },
  },
  instructionText: {
    font: { sz: 10, name: 'Calibri' },
    alignment: { horizontal: 'left', wrapText: true },
  },
};

// Helper to get column letter from index
function getColLetter(index: number): string {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

// Helper to apply data validation
function addDataValidation(
  sheet: WorkSheet,
  colIndex: number,
  startRow: number,
  endRow: number,
  options: string[]
): void {
  const col = getColLetter(colIndex);
  const range = `${col}${startRow}:${col}${endRow}`;

  if (!sheet['!dataValidation']) {
    sheet['!dataValidation'] = [];
  }

  (sheet['!dataValidation'] as unknown[]).push({
    sqref: range,
    type: 'list',
    formula1: `"${options.join(',')}"`,
  });
}

export class TemplateService {
  static async generateStudentRegistrationTemplate(
    className?: string,
    departmentName?: string,
    expectedCount: number = 50
  ): Promise<void> {
    const XLSX = (await import('xlsx-js-style')).default;
    const columns: TemplateColumn[] = [
      { header: 'Full Name', key: 'full_name', width: 28, required: true, example: 'John Doe Mensah' },
      { header: 'Gender', key: 'gender', width: 12, required: true, validation: { type: 'list', options: ['Male', 'Female'] }, example: 'Male' },
      { header: 'Date of Birth', key: 'date_of_birth', width: 16, required: true, validation: { type: 'date', format: 'DD/MM/YYYY' }, example: '15/06/2010' },
      { header: 'Department', key: 'department_id', width: 18, example: departmentName || 'Primary' },
      { header: 'Class', key: 'class_id', width: 14, example: className || 'Class 1' },
      { header: 'Guardian Name', key: 'guardian_name', width: 25, required: true, example: 'Mary Mensah' },
      { header: 'Guardian Phone', key: 'guardian_phone', width: 18, required: true, example: '+233241234568' },
      { header: 'Address', key: 'address', width: 35, required: true, example: 'P.O. Box 123, Accra' }
    ];

    const workbook = XLSX.utils.book_new();

    // ===== INSTRUCTIONS SHEET =====
    const instructionData = [
      ['📚 STUDENT REGISTRATION TEMPLATE'],
      [''],
      ['How to Use This Template:'],
      [''],
      ['1. REQUIRED FIELDS (Orange headers):'],
      ['   • Full Name - Enter complete name including family name'],
      ['   • Gender - Select Male or Female from dropdown'],
      ['   • Date of Birth - Use DD/MM/YYYY format (e.g., 15/06/2010)'],
      ['   • Guardian Name - Full name of parent/guardian'],
      ['   • Guardian Phone - Include country code (+233 for Ghana)'],
      ['   • Address - Include region for Ghana locations'],
      [''],
      ['2. OPTIONAL FIELDS (Blue headers):'],
      ['   • Department - Name of department (e.g., Primary, JHS, SHS)'],
      ['   • Class - Name of class (e.g., Class 1, JHS 1)'],
      [''],
      ['3. IMPORTANT NOTES:'],
      ['   ⚡ Student IDs are auto-generated - do NOT add a Student ID column'],
      ['   ⚡ Academic Year is pulled from your Grading Settings'],
      ['   ⚡ The GREEN row shows example data - replace it with real data'],
      [''],
      ['4. TIPS FOR SUCCESS:'],
      ['   ✓ Use the dropdown menus where available'],
      ['   ✓ Phone numbers should start with +233'],
      ['   ✓ Keep names consistent with Ghanaian naming conventions'],
      ['   ✓ Save as Excel (.xlsx) before uploading'],
      [''],
      className ? [`📍 Target Class: ${className}`] : [''],
      departmentName ? [`📍 Target Department: ${departmentName}`] : [''],
    ].map(row => [Array.isArray(row) ? row[0] : row]);

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionData);

    // Style instructions
    instructionsSheet['A1'] = { v: instructionData[0][0], s: styles.instructionTitle };
    for (let i = 2; i < instructionData.length; i++) {
      const cellRef = `A${i + 1}`;
      const value = instructionData[i][0];
      if (typeof value === 'string' && (value.includes('REQUIRED') || value.includes('OPTIONAL') || value.includes('NOTES') || value.includes('TIPS'))) {
        instructionsSheet[cellRef] = { v: value, s: styles.instructionHeader };
      }
    }

    instructionsSheet['!cols'] = [{ width: 80 }];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // ===== DATA SHEET =====
    const dataRows: (string | number)[][] = [];

    // Header row
    const headers = columns.map(col => col.required ? `${col.header} *` : col.header);
    dataRows.push(headers);

    // Example row
    const sampleRow = columns.map(col => col.example || '');
    dataRows.push(sampleRow);

    // Empty rows for data entry
    for (let i = 0; i < expectedCount - 1; i++) {
      dataRows.push(new Array(columns.length).fill(''));
    }

    const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);

    // Apply header styles
    columns.forEach((col, idx) => {
      const cellRef = `${getColLetter(idx)}1`;
      const style = col.required ? styles.requiredHeader : styles.headerCell;
      dataSheet[cellRef] = {
        v: col.required ? `${col.header} *` : col.header,
        s: style
      };
    });

    // Apply example row style
    columns.forEach((col, idx) => {
      const cellRef = `${getColLetter(idx)}2`;
      dataSheet[cellRef] = { v: col.example || '', s: styles.exampleCell };
    });

    // Apply data cell styles (alternating)
    for (let row = 3; row <= expectedCount + 1; row++) {
      const isAlternate = row % 2 === 0;
      columns.forEach((_, idx) => {
        const cellRef = `${getColLetter(idx)}${row}`;
        if (!dataSheet[cellRef]) {
          dataSheet[cellRef] = { v: '', s: isAlternate ? styles.alternateCell : styles.dataCell };
        } else {
          dataSheet[cellRef].s = isAlternate ? styles.alternateCell : styles.dataCell;
        }
      });
    }

    // Set column widths
    dataSheet['!cols'] = columns.map(col => ({ width: col.width || 20 }));

    // Freeze header row
    dataSheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Add data validation for Gender column
    const genderColIdx = columns.findIndex(c => c.key === 'gender');
    if (genderColIdx >= 0) {
      addDataValidation(dataSheet, genderColIdx, 3, expectedCount + 1, ['Male', 'Female']);
    }

    // Set row heights
    dataSheet['!rows'] = [{ hpt: 30 }]; // Header row height

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Student Data');

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Student_Registration_Template_${className || 'All_Classes'}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);
  }

  static async generateResultsEntryTemplate(
    className?: string,
    departmentName?: string,
    students: Array<{ student_id: string; full_name: string }> = [],
    subjects: Array<{ name: string; code?: string }> = [],
    caTypes: Array<{ id: string; name: string }> = [],
    academicYear?: string,
    nextTermBegin?: string
  ): Promise<void> {
    const XLSX = (await import('xlsx-js-style')).default;
    // Get example CA Type from the list or use default
    const caTypeExample = caTypes.length > 0 ? caTypes[0].name : 'SBA 30/70';
    const caTypeOptions = caTypes.length > 0 ? caTypes.map(ct => ct.name) : undefined;

    const baseColumns: TemplateColumn[] = [
      { header: 'Student ID', key: 'student_id', width: 14, required: true },
      { header: 'Student Name', key: 'student_name', width: 25 },
      {
        header: 'CA Type',
        key: 'ca_type',
        width: 16,
        required: true,
        example: caTypeExample,
        validation: caTypeOptions ? { type: 'list', options: caTypeOptions } : undefined
      },
      { header: 'Term', key: 'term', width: 12, required: true, validation: { type: 'list', options: ['first', 'second', 'third'] } },
      { header: 'Academic Year', key: 'academic_year', width: 14, required: true, example: academicYear || '2024/2025' }
    ];

    // Add subject columns with CA and Exam
    const subjectColumns: TemplateColumn[] = [];
    subjects.forEach(subject => {
      subjectColumns.push(
        { header: `${subject.name} - CA`, key: `${subject.code}_ca`, width: 14, validation: { type: 'number' } },
        { header: `${subject.name} - Exam`, key: `${subject.code}_exam`, width: 14, validation: { type: 'number' } }
      );
    });

    const attendanceColumns: TemplateColumn[] = [
      { header: 'Days Present', key: 'days_present', width: 14, validation: { type: 'number' } },
      { header: "Head's Remarks", key: 'heads_remarks', width: 35 },
      { header: 'Next Term Begins', key: 'next_term_begin', width: 22 },
    ];

    const allColumns = [...baseColumns, ...subjectColumns, ...attendanceColumns];

    const workbook = XLSX.utils.book_new();

    // ===== INSTRUCTIONS SHEET =====
    // Build CA Type section dynamically
    const caTypeSection = caTypes.length > 0
      ? [
        ['2. CONFIGURED CA TYPES (Use exactly as shown):'],
        ...caTypes.map(ct => [`   • ${ct.name}`]),
        ['']
      ]
      : [
        ['2. CA TYPE EXAMPLES:'],
        ['   Below are examples of valid CA Types. Use the exact name configured in your system:'],
        ['   • SBA 30/70 (if configured)'],
        ['   • SBA 40/60 (if configured)'],
        ['   • SBA 50/50 (if configured)'],
        ['   • Your custom assessment type name (if configured)'],
        ['   Note: If your CA Type is not found, check the exact spelling and spacing in your system settings.'],
        ['']
      ];

    const instructionData = [
      ['📊 RESULTS ENTRY TEMPLATE'],
      [''],
      ['How to Use This Template:'],
      [''],
      ['1. REQUIRED FIELDS (Orange headers):'],
      ['   • Student ID - Must match existing student records in your system'],
      ['   • CA Type - Use EXACTLY one of the configured assessment types shown below'],
      ['   • Term - Select: first, second, or third'],
      ['   • Academic Year - Format: 2024/2025 (must match your grading settings)'],
      [''],
      ...caTypeSection,
      ['3. SCORE ENTRY:'],
      ['   • CA Columns - Enter continuous assessment scores (0-100)'],
      ['   • Exam Column - Enter examination score (0-100)'],
      ['   • Leave cells blank if the assessment was not taken'],
      [''],
      ['4. ATTENDANCE:'],
      ['   • Days Present - Number of days student was present this term'],
      [''],
      ['5. IMPORTANT NOTES:'],
      ['   • All required fields (marked with *) must be filled'],
      ['   • Students must exist in the system already'],
      ['   • Do not modify the column headers'],
      ['   • Save file as .xlsx (Excel format)'],
      ['   • If import fails, check the CA Type spelling against configured types'],
      [''],
      className ? [`📍 Class: ${className}`] : [''],
      departmentName ? [`📍 Department: ${departmentName}`] : [''],
      caTypes.length > 0 ? [`📍 Available CA Types: ${caTypes.map(ct => ct.name).join(', ')}`] : [''],
      academicYear ? [`📍 Academic Year: ${academicYear}`] : [''],
    ].map(row => [Array.isArray(row) ? row[0] : row]);

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionData);
    instructionsSheet['A1'] = { v: instructionData[0][0], s: styles.instructionTitle };
    instructionsSheet['!cols'] = [{ width: 80 }];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // ===== DATA SHEET =====
    const dataRows: (string | number)[][] = [];

    // Header row
    const headers = allColumns.map(col => col.required ? `${col.header} *` : col.header);
    dataRows.push(headers);

    // Add student rows if provided
    if (students.length > 0) {
      students.forEach(student => {
        const row: (string | number)[] = [
          student.student_id,
          student.full_name,
          caTypes.length > 0 ? caTypes[0].name : '',
          '',  // term
          academicYear || '2024/2025',
          ...new Array(subjectColumns.length).fill(''),
          '',  // days present
          '',  // heads remarks
          nextTermBegin || '',  // next term begins — pre-filled from grading settings
        ];
        dataRows.push(row);
      });
    } else {
      // Sample row
      const sampleRow: (string | number)[] = [
        'STD001',
        'Sample Student Name',
        caTypeExample,
        'first',
        academicYear || '2024/2025',
        ...new Array(subjectColumns.length).fill(''),
        '',  // days present
        '',  // heads remarks
        nextTermBegin || '',  // next term begins — pre-filled from grading settings
      ];
      dataRows.push(sampleRow);

      // Empty rows
      for (let i = 0; i < 20; i++) {
        dataRows.push(new Array(allColumns.length).fill(''));
      }
    }

    const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);

    // Apply header styles
    allColumns.forEach((col, idx) => {
      const cellRef = `${getColLetter(idx)}1`;
      const style = col.required ? styles.requiredHeader : styles.headerCell;
      dataSheet[cellRef] = {
        v: col.required ? `${col.header} *` : col.header,
        s: style
      };
    });

    // Apply data cell styles
    const totalRows = dataRows.length;
    for (let row = 2; row <= totalRows; row++) {
      const isAlternate = row % 2 === 1;
      allColumns.forEach((_, idx) => {
        const cellRef = `${getColLetter(idx)}${row}`;
        if (dataSheet[cellRef]) {
          dataSheet[cellRef].s = row === 2 && students.length === 0 ? styles.exampleCell : (isAlternate ? styles.alternateCell : styles.dataCell);
        } else {
          dataSheet[cellRef] = { v: '', s: isAlternate ? styles.alternateCell : styles.dataCell };
        }
      });
    }

    // Set column widths
    dataSheet['!cols'] = allColumns.map(col => ({ width: col.width || 15 }));

    // Freeze header row
    dataSheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Add Term dropdown validation
    const termColIdx = allColumns.findIndex(c => c.key === 'term');
    if (termColIdx >= 0) {
      addDataValidation(dataSheet, termColIdx, 2, totalRows, ['first', 'second', 'third']);
    }

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Results Data');

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const caTypeSuffix = caTypes.length > 0 ? `_${caTypes[0].name.replace(/\s+/g, '_')}` : '';
    const filename = `Results_Entry_Template_${className || 'All_Classes'}${caTypeSuffix}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);
  }

  static async generateAttendanceTemplate(
    className?: string,
    students: Array<{ student_id: string; full_name: string }> = []
  ): Promise<void> {
    const XLSX = (await import('xlsx-js-style')).default;
    const columns: TemplateColumn[] = [
      { header: 'Date', key: 'date', width: 16, required: true, validation: { type: 'date', format: 'DD/MM/YYYY' } },
      { header: 'Student ID', key: 'student_id', width: 14, required: true },
      { header: 'Student Name', key: 'student_name', width: 25 },
      { header: 'Status', key: 'status', width: 14, required: true, validation: { type: 'list', options: ['Present', 'Absent', 'Late', 'Excused'] } },
      { header: 'Notes', key: 'notes', width: 30 }
    ];

    const workbook = XLSX.utils.book_new();

    // Data sheet
    const dataRows: (string | number)[][] = [];
    const headers = columns.map(col => col.required ? `${col.header} *` : col.header);
    dataRows.push(headers);

    if (students.length > 0) {
      students.forEach(student => {
        dataRows.push(['', student.student_id, student.full_name, '', '']);
      });
    }

    const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);

    // Apply header styles
    columns.forEach((col, idx) => {
      const cellRef = `${getColLetter(idx)}1`;
      const style = col.required ? styles.requiredHeader : styles.headerCell;
      dataSheet[cellRef] = {
        v: col.required ? `${col.header} *` : col.header,
        s: style
      };
    });

    // Apply data styles
    for (let row = 2; row <= dataRows.length; row++) {
      const isAlternate = row % 2 === 0;
      columns.forEach((_, idx) => {
        const cellRef = `${getColLetter(idx)}${row}`;
        if (dataSheet[cellRef]) {
          dataSheet[cellRef].s = isAlternate ? styles.alternateCell : styles.dataCell;
        }
      });
    }

    dataSheet['!cols'] = columns.map(col => ({ width: col.width || 20 }));
    dataSheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Add status dropdown
    const statusColIdx = columns.findIndex(c => c.key === 'status');
    if (statusColIdx >= 0) {
      addDataValidation(dataSheet, statusColIdx, 2, dataRows.length + 50, ['Present', 'Absent', 'Late', 'Excused']);
    }

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Attendance Data');

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Attendance_Template_${className || 'All_Classes'}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);
  }
}
