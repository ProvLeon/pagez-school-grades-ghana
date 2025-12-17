import { useState } from 'react';
import * as XLSX from 'xlsx';

export interface ParsedResultData {
  student_id: string;
  student_name?: string;
  term: 'first' | 'second' | 'third';
  academic_year: string;
  days_school_opened?: number;
  days_present?: number;
  days_absent?: number;
  subjects: {
    subject_code: string;
    subject_name: string;
    ca1_score?: number;
    ca2_score?: number;
    ca3_score?: number;
    ca4_score?: number;
    exam_score?: number;
  }[];
}

export interface ResultsParseResult {
  success: boolean;
  data: ParsedResultData[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  validRows: number;
  subjectsFound: string[];
}

export const useResultsExcelParser = () => {
  const [isLoading, setIsLoading] = useState(false);

  const parseResultsFile = async (file: File): Promise<ResultsParseResult> => {
    setIsLoading(true);

    try {
      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });

            // Find the data sheet (skip Instructions sheet)
            let sheetName = workbook.SheetNames.find(name =>
              name.toLowerCase().includes('data') ||
              name.toLowerCase().includes('result')
            ) || workbook.SheetNames[0];

            // Skip if it's the instructions sheet
            if (sheetName.toLowerCase() === 'instructions' && workbook.SheetNames.length > 1) {
              sheetName = workbook.SheetNames[1];
            }

            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON with header mapping
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              defval: ''
            }) as any[][];

            if (jsonData.length < 2) {
              resolve({
                success: false,
                data: [],
                errors: ['File appears to be empty or has no data rows'],
                warnings: [],
                totalRows: 0,
                validRows: 0,
                subjectsFound: []
              });
              return;
            }

            // Get header row
            const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());
            const dataRows = jsonData.slice(1);

            // Find base column indices
            const studentIdIndex = findColumnIndex(headers, ['student id*', 'student_id*', 'student id', 'student_id', 'id']);
            const studentNameIndex = findColumnIndex(headers, ['student name', 'student_name', 'name', 'full name', 'full_name']);
            const termIndex = findColumnIndex(headers, ['term*', 'term']);
            const academicYearIndex = findColumnIndex(headers, ['academic year*', 'academic_year*', 'academic year', 'academic_year', 'year']);
            const daysOpenedIndex = findColumnIndex(headers, ['days school opened', 'days_school_opened', 'school days']);
            const daysPresentIndex = findColumnIndex(headers, ['days present', 'days_present', 'present']);
            const daysAbsentIndex = findColumnIndex(headers, ['days absent', 'days_absent', 'absent']);

            // Check for required columns
            if (studentIdIndex === -1) {
              resolve({
                success: false,
                data: [],
                errors: ['Missing required column: Student ID'],
                warnings: [],
                totalRows: dataRows.length,
                validRows: 0,
                subjectsFound: []
              });
              return;
            }

            // Find subject columns (columns with - CA1, - CA2, etc.)
            const subjectColumns = findSubjectColumns(headers);
            const subjectsFound = [...new Set(subjectColumns.map(sc => sc.subjectName))];

            if (subjectColumns.length === 0) {
              resolve({
                success: false,
                data: [],
                errors: ['No subject score columns found. Expected format: "Subject Name - CA1", "Subject Name - Exam", etc.'],
                warnings: [],
                totalRows: dataRows.length,
                validRows: 0,
                subjectsFound: []
              });
              return;
            }

            const parsedData: ParsedResultData[] = [];
            const errors: string[] = [];
            const warnings: string[] = [];

            dataRows.forEach((row: any[], index: number) => {
              const rowNumber = index + 2; // +2 because of header and 0-based index

              // Skip empty rows
              if (row.every(cell => !cell || String(cell).trim() === '')) {
                return;
              }

              try {
                const studentId = getCellValue(row, studentIdIndex);
                const studentName = getCellValue(row, studentNameIndex);
                const termRaw = getCellValue(row, termIndex).toLowerCase();
                const academicYear = getCellValue(row, academicYearIndex);

                // Validate required fields
                if (!studentId) {
                  errors.push(`Row ${rowNumber}: Student ID is required`);
                  return;
                }

                // Validate term
                let term: 'first' | 'second' | 'third';
                if (termRaw === 'first' || termRaw === '1' || termRaw === '1st') {
                  term = 'first';
                } else if (termRaw === 'second' || termRaw === '2' || termRaw === '2nd') {
                  term = 'second';
                } else if (termRaw === 'third' || termRaw === '3' || termRaw === '3rd') {
                  term = 'third';
                } else if (!termRaw) {
                  warnings.push(`Row ${rowNumber}: Term not specified, defaulting to 'first'`);
                  term = 'first';
                } else {
                  errors.push(`Row ${rowNumber}: Invalid term "${termRaw}". Must be "first", "second", or "third"`);
                  return;
                }

                // Parse attendance
                const daysSchoolOpened = parseNumber(getCellValue(row, daysOpenedIndex));
                const daysPresent = parseNumber(getCellValue(row, daysPresentIndex));
                const daysAbsent = parseNumber(getCellValue(row, daysAbsentIndex));

                // Parse subject scores
                const subjects = parseSubjectScores(row, subjectColumns, rowNumber, warnings);

                // Check if at least one subject has scores
                const hasScores = subjects.some(s =>
                  s.ca1_score !== undefined ||
                  s.ca2_score !== undefined ||
                  s.ca3_score !== undefined ||
                  s.ca4_score !== undefined ||
                  s.exam_score !== undefined
                );

                if (!hasScores) {
                  warnings.push(`Row ${rowNumber}: No subject scores found for student ${studentId}`);
                }

                parsedData.push({
                  student_id: studentId,
                  student_name: studentName || undefined,
                  term,
                  academic_year: academicYear || '2024/2025',
                  days_school_opened: daysSchoolOpened,
                  days_present: daysPresent,
                  days_absent: daysAbsent,
                  subjects: subjects.filter(s =>
                    s.ca1_score !== undefined ||
                    s.ca2_score !== undefined ||
                    s.ca3_score !== undefined ||
                    s.ca4_score !== undefined ||
                    s.exam_score !== undefined
                  )
                });

              } catch (error) {
                errors.push(`Row ${rowNumber}: Error parsing data - ${error}`);
              }
            });

            resolve({
              success: errors.length === 0,
              data: parsedData,
              errors,
              warnings,
              totalRows: dataRows.filter(row => !row.every(cell => !cell || String(cell).trim() === '')).length,
              validRows: parsedData.length,
              subjectsFound
            });

          } catch (error) {
            resolve({
              success: false,
              data: [],
              errors: [`Error parsing Excel file: ${error}`],
              warnings: [],
              totalRows: 0,
              validRows: 0,
              subjectsFound: []
            });
          } finally {
            setIsLoading(false);
          }
        };

        reader.onerror = () => {
          resolve({
            success: false,
            data: [],
            errors: ['Error reading file'],
            warnings: [],
            totalRows: 0,
            validRows: 0,
            subjectsFound: []
          });
          setIsLoading(false);
        };

        reader.readAsBinaryString(file);
      });
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        data: [],
        errors: [`Error processing file: ${error}`],
        warnings: [],
        totalRows: 0,
        validRows: 0,
        subjectsFound: []
      };
    }
  };

  return {
    parseResultsFile,
    isLoading
  };
};

// Helper types
interface SubjectColumn {
  subjectName: string;
  subjectCode: string;
  columnIndex: number;
  scoreType: 'ca1' | 'ca2' | 'ca3' | 'ca4' | 'exam';
}

// Helper functions
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h === name.toLowerCase() || h.includes(name.toLowerCase()));
    if (index !== -1) return index;
  }
  return -1;
}

function getCellValue(row: any[], columnIndex: number): string {
  if (columnIndex === -1 || row[columnIndex] === undefined || row[columnIndex] === null) return '';
  return String(row[columnIndex]).trim();
}

function parseNumber(value: string): number | undefined {
  if (!value) return undefined;
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}

function findSubjectColumns(headers: string[]): SubjectColumn[] {
  const subjectColumns: SubjectColumn[] = [];
  const scoreTypePatterns = [
    { pattern: /- ca1$/i, type: 'ca1' as const },
    { pattern: /- ca2$/i, type: 'ca2' as const },
    { pattern: /- ca3$/i, type: 'ca3' as const },
    { pattern: /- ca4$/i, type: 'ca4' as const },
    { pattern: /- exam$/i, type: 'exam' as const },
  ];

  headers.forEach((header, index) => {
    for (const { pattern, type } of scoreTypePatterns) {
      if (pattern.test(header)) {
        // Extract subject name (everything before the pattern)
        const subjectName = header.replace(pattern, '').trim();
        // Generate a simple code from the name
        const subjectCode = subjectName
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase())
          .join('');

        subjectColumns.push({
          subjectName,
          subjectCode,
          columnIndex: index,
          scoreType: type
        });
        break;
      }
    }
  });

  return subjectColumns;
}

function parseSubjectScores(
  row: any[],
  subjectColumns: SubjectColumn[],
  rowNumber: number,
  warnings: string[]
): ParsedResultData['subjects'] {
  // Group columns by subject
  const subjectMap = new Map<string, {
    subject_code: string;
    subject_name: string;
    ca1_score?: number;
    ca2_score?: number;
    ca3_score?: number;
    ca4_score?: number;
    exam_score?: number;
  }>();

  subjectColumns.forEach(col => {
    const key = col.subjectName.toLowerCase();

    if (!subjectMap.has(key)) {
      subjectMap.set(key, {
        subject_code: col.subjectCode,
        subject_name: col.subjectName
      });
    }

    const subject = subjectMap.get(key)!;
    const rawValue = getCellValue(row, col.columnIndex);

    if (rawValue) {
      const score = parseFloat(rawValue);

      if (isNaN(score)) {
        warnings.push(`Row ${rowNumber}: Invalid score "${rawValue}" for ${col.subjectName} ${col.scoreType.toUpperCase()}`);
      } else if (score < 0 || score > 100) {
        warnings.push(`Row ${rowNumber}: Score ${score} for ${col.subjectName} ${col.scoreType.toUpperCase()} is out of range (0-100)`);
      } else {
        switch (col.scoreType) {
          case 'ca1':
            subject.ca1_score = score;
            break;
          case 'ca2':
            subject.ca2_score = score;
            break;
          case 'ca3':
            subject.ca3_score = score;
            break;
          case 'ca4':
            subject.ca4_score = score;
            break;
          case 'exam':
            subject.exam_score = score;
            break;
        }
      }
    }
  });

  return Array.from(subjectMap.values());
}
