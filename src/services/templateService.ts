
import * as XLSX from 'xlsx';
import { useClasses } from '@/hooks/useClasses';
import { useDepartments } from '@/hooks/useDepartments';
import { useSubjects } from '@/hooks/useSubjects';

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

export class TemplateService {
  static generateStudentRegistrationTemplate(
    className?: string,
    departmentName?: string,
    expectedCount: number = 50
  ): void {
    const columns: TemplateColumn[] = [
      { header: 'Student ID*', key: 'student_id', width: 15, required: true, example: 'STD001' },
      { header: 'Full Name*', key: 'full_name', width: 25, required: true, example: 'John Doe Mensah' },
      { header: 'Gender*', key: 'gender', width: 10, required: true, validation: { type: 'list', options: ['Male', 'Female'] }, example: 'Male' },
      { header: 'Date of Birth (DD/MM/YYYY)*', key: 'date_of_birth', width: 20, required: true, validation: { type: 'date', format: 'DD/MM/YYYY' }, example: '15/06/2010' },
      { header: 'Email', key: 'email', width: 25, example: 'john.mensah@example.com' },
      { header: 'Phone', key: 'phone', width: 15, example: '+233241234567' },
      { header: 'Guardian Name*', key: 'guardian_name', width: 25, required: true, example: 'Mary Mensah' },
      { header: 'Guardian Phone*', key: 'guardian_phone', width: 18, required: true, example: '+233241234568' },
      { header: 'Guardian Email', key: 'guardian_email', width: 25, example: 'mary.mensah@example.com' },
      { header: 'Address*', key: 'address', width: 40, required: true, example: 'P.O. Box 123, Accra, Greater Accra Region' },
      { header: 'Academic Year*', key: 'academic_year', width: 15, required: true, example: '2024/2025' }
    ];

    const workbook = XLSX.utils.book_new();
    
    // Create instructions sheet
    const instructions = [
      ['STUDENT REGISTRATION TEMPLATE - INSTRUCTIONS'],
      [''],
      ['Please follow these guidelines when filling the template:'],
      [''],
      ['1. REQUIRED FIELDS (marked with *):'],
      ['   - Student ID: Must be unique within the school'],
      ['   - Full Name: Enter complete name including family name'],
      ['   - Gender: Select either "Male" or "Female"'],
      ['   - Date of Birth: Use DD/MM/YYYY format (e.g., 15/06/2010)'],
      ['   - Guardian Name: Full name of parent/guardian'],
      ['   - Guardian Phone: Include country code (+233 for Ghana)'],
      ['   - Address: Include region for Ghana locations'],
      ['   - Academic Year: Current academic year'],
      [''],
      ['2. OPTIONAL FIELDS:'],
      ['   - Email: Student email (if available)'],
      ['   - Phone: Student phone (if available)'],
      ['   - Guardian Email: Guardian email address'],
      [''],
      ['3. GHANA-SPECIFIC GUIDELINES:'],
      ['   - Phone numbers should start with +233'],
      ['   - Address should include the region (e.g., Greater Accra, Ashanti)'],
      ['   - Names should reflect Ghanaian naming conventions'],
      [''],
      ['4. DATA VALIDATION:'],
      ['   - Duplicate Student IDs will be rejected'],
      ['   - Invalid date formats will cause errors'],
      ['   - Missing required fields will prevent upload'],
      [''],
      className ? [`5. TARGET CLASS: ${className}`] : [],
      departmentName ? [`6. TARGET DEPARTMENT: ${departmentName}`] : [],
      [''],
      ['After filling this template, save as Excel (.xlsx) and upload through the Bulk Operations section.']
    ].flat().map(instruction => [instruction]); // Convert to 2D array

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Create data sheet with headers and sample rows
    const headers = columns.map(col => col.header);
    const sampleRow = columns.map(col => col.example || '');
    
    // Generate empty rows for data entry
    const dataRows = [headers];
    dataRows.push(sampleRow); // Sample row
    
    // Add empty rows based on expected count
    for (let i = 0; i < expectedCount - 1; i++) {
      dataRows.push(new Array(columns.length).fill(''));
    }

    const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);
    
    // Set column widths
    const colWidths = columns.map(col => ({ width: col.width || 20 }));
    dataSheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Student Data');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Student_Registration_Template_${className || 'All_Classes'}_${timestamp}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  }

  static generateResultsEntryTemplate(
    className?: string,
    departmentName?: string,
    students: any[] = [],
    subjects: any[] = []
  ): void {
    const baseColumns: TemplateColumn[] = [
      { header: 'Student ID*', key: 'student_id', width: 15, required: true },
      { header: 'Student Name', key: 'student_name', width: 25 },
      { header: 'Term*', key: 'term', width: 10, required: true, validation: { type: 'list', options: ['first', 'second', 'third'] } },
      { header: 'Academic Year*', key: 'academic_year', width: 15, required: true, example: '2024/2025' }
    ];

    // Add subject columns
    const subjectColumns: TemplateColumn[] = [];
    subjects.forEach(subject => {
      subjectColumns.push(
        { header: `${subject.name} - CA1`, key: `${subject.code}_ca1`, width: 12, validation: { type: 'number' } },
        { header: `${subject.name} - CA2`, key: `${subject.code}_ca2`, width: 12, validation: { type: 'number' } },
        { header: `${subject.name} - CA3`, key: `${subject.code}_ca3`, width: 12, validation: { type: 'number' } },
        { header: `${subject.name} - CA4`, key: `${subject.code}_ca4`, width: 12, validation: { type: 'number' } },
        { header: `${subject.name} - Exam`, key: `${subject.code}_exam`, width: 12, validation: { type: 'number' } }
      );
    });

    const attendanceColumns: TemplateColumn[] = [
      { header: 'Days School Opened', key: 'days_school_opened', width: 18, validation: { type: 'number' } },
      { header: 'Days Present', key: 'days_present', width: 15, validation: { type: 'number' } },
      { header: 'Days Absent', key: 'days_absent', width: 15, validation: { type: 'number' } }
    ];

    const allColumns = [...baseColumns, ...subjectColumns, ...attendanceColumns];

    const workbook = XLSX.utils.book_new();
    
    // Create instructions sheet
    const instructions = [
      ['RESULTS ENTRY TEMPLATE - INSTRUCTIONS'],
      [''],
      ['Please follow these guidelines when entering student results:'],
      [''],
      ['1. REQUIRED FIELDS (marked with *):'],
      ['   - Student ID: Must match existing student records'],
      ['   - Term: Select "first", "second", or "third"'],
      ['   - Academic Year: Current academic year (e.g., 2024/2025)'],
      [''],
      ['2. SCORE ENTRY:'],
      ['   - CA1, CA2, CA3, CA4: Continuous Assessment scores (0-100)'],
      ['   - Exam: Final examination score (0-100)'],
      ['   - Leave blank if assessment not taken'],
      [''],
      ['3. ATTENDANCE:'],
      ['   - Days School Opened: Total school days in term'],
      ['   - Days Present: Days student was present'],
      ['   - Days Absent: Days student was absent'],
      [''],
      ['4. GHANA EDUCATION SERVICE (GES) COMPLIANCE:'],
      ['   - Follow GES assessment guidelines'],
      ['   - Ensure all SBA components are included'],
      ['   - Marks must be numerical (0-100)'],
      ['   - Total score will be calculated automatically'],
      [''],
      ['5. VALIDATION RULES:'],
      ['   - Student IDs must exist in the system'],
      ['   - Scores must be between 0 and 100'],
      ['   - Attendance figures must be logical'],
      [''],
      className ? [`6. TARGET CLASS: ${className}`] : [],
      departmentName ? [`7. TARGET DEPARTMENT: ${departmentName}`] : [],
      [''],
      ['After filling this template, save as Excel (.xlsx) and upload through the Bulk Operations section.']
    ].flat().map(instruction => [instruction]); // Convert to 2D array

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Create data sheet with headers and student data
    const headers = allColumns.map(col => col.header);
    const dataRows = [headers];
    
    // Add student rows if provided
    if (students.length > 0) {
      students.forEach(student => {
        const row = [
          student.student_id,
          student.full_name,
          '', // term - to be filled
          '2024/2025', // academic year
          ...new Array(subjectColumns.length).fill(''), // subject scores
          '', '', '' // attendance fields
        ];
        dataRows.push(row);
      });
    } else {
      // Add sample row and empty rows
      const sampleRow = [
        'STD001',
        'Sample Student Name',
        'first',
        '2024/2025',
        ...new Array(subjectColumns.length).fill(''),
        '', '', ''
      ];
      dataRows.push(sampleRow);
      
      // Add 20 empty rows for manual entry
      for (let i = 0; i < 20; i++) {
        dataRows.push(new Array(allColumns.length).fill(''));
      }
    }

    const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);
    
    // Set column widths
    const colWidths = allColumns.map(col => ({ width: col.width || 15 }));
    dataSheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Results Data');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Results_Entry_Template_${className || 'All_Classes'}_${timestamp}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  }

  static generateAttendanceTemplate(
    className?: string,
    students: any[] = []
  ): void {
    const columns: TemplateColumn[] = [
      { header: 'Date (DD/MM/YYYY)*', key: 'date', width: 18, required: true, validation: { type: 'date', format: 'DD/MM/YYYY' } },
      { header: 'Student ID*', key: 'student_id', width: 15, required: true },
      { header: 'Student Name', key: 'student_name', width: 25 },
      { header: 'Status*', key: 'status', width: 12, required: true, validation: { type: 'list', options: ['Present', 'Absent', 'Late', 'Excused'] } },
      { header: 'Notes', key: 'notes', width: 30 }
    ];

    const workbook = XLSX.utils.book_new();
    
    // Create data sheet
    const headers = columns.map(col => col.header);
    const dataRows = [headers];
    
    // Add student rows if provided
    if (students.length > 0) {
      students.forEach(student => {
        const row = [
          '', // date - to be filled
          student.student_id,
          student.full_name,
          '', // status - to be filled
          '' // notes
        ];
        dataRows.push(row);
      });
    }

    const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);
    const colWidths = columns.map(col => ({ width: col.width || 20 }));
    dataSheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Attendance Data');

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Attendance_Template_${className || 'All_Classes'}_${timestamp}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  }
}
