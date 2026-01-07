import { useState } from 'react';
import * as XLSX from 'xlsx';
import { formatDate, formatPhoneNumber } from '@/utils/dateUtils';

export interface ParsedStudentData {
  student_id: string;
  full_name: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  class_id?: string;
  department_id?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  address?: string;
  academic_year?: string;
}

export interface ParseResult {
  success: boolean;
  data: ParsedStudentData[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

export const useExcelParser = () => {
  const [isLoading, setIsLoading] = useState(false);

  const parseStudentFile = async (file: File): Promise<ParseResult> => {
    setIsLoading(true);

    try {
      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });

            // Find the "Student Data" sheet in the workbook
            // Priority: 1) Exact match "Student Data", 2) Contains "student" or "data", 3) First non-Instructions sheet
            let sheetName = workbook.SheetNames.find(name =>
              name.toLowerCase() === 'student data'
            );

            if (!sheetName) {
              sheetName = workbook.SheetNames.find(name =>
                name.toLowerCase().includes('student') ||
                (name.toLowerCase().includes('data') && !name.toLowerCase().includes('instruction'))
              );
            }

            if (!sheetName) {
              // Skip Instructions sheet, use first available data sheet
              sheetName = workbook.SheetNames.find(name =>
                name.toLowerCase() !== 'instructions'
              ) || workbook.SheetNames[0];
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
                totalRows: 0,
                validRows: 0
              });
              return;
            }

            // Get header row and map column indices
            const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());
            const dataRows = jsonData.slice(1);

            // Column mapping for different possible header names
            const columnMap = {
              student_id: findColumnIndex(headers, ['student_id', 'student id', 'id', 'student number']),
              full_name: findColumnIndex(headers, ['full_name', 'full name', 'name', 'student name']),
              email: findColumnIndex(headers, ['email', 'email address', 'student email']),
              date_of_birth: findColumnIndex(headers, ['date_of_birth', 'date of birth', 'dob', 'birth date']),
              gender: findColumnIndex(headers, ['gender', 'sex']),
              class_id: findColumnIndex(headers, ['class_id', 'class id', 'class']),
              department_id: findColumnIndex(headers, ['department_id', 'department id', 'department']),
              guardian_name: findColumnIndex(headers, ['guardian_name', 'guardian name', 'parent name', 'guardian']),
              guardian_phone: findColumnIndex(headers, ['guardian_phone', 'guardian phone', 'parent phone', 'guardian contact']),
              guardian_email: findColumnIndex(headers, ['guardian_email', 'guardian email', 'parent email']),
              address: findColumnIndex(headers, ['address', 'residential address', 'home address']),
              academic_year: findColumnIndex(headers, ['academic_year', 'academic year', 'year'])
            };

            // Check for required columns (student_id is auto-generated, so only full_name is required)
            const requiredColumns = ['full_name'];
            const missingColumns = requiredColumns.filter(col => columnMap[col as keyof typeof columnMap] === -1);

            if (missingColumns.length > 0) {
              resolve({
                success: false,
                data: [],
                errors: [`Missing required columns: ${missingColumns.join(', ')}`],
                totalRows: dataRows.length,
                validRows: 0
              });
              return;
            }

            const parsedData: ParsedStudentData[] = [];
            const errors: string[] = [];

            dataRows.forEach((row: any[], index: number) => {
              const rowNumber = index + 2; // +2 because of header and 0-based index

              // Skip empty rows
              if (row.every(cell => !cell || String(cell).trim() === '')) {
                return;
              }

              try {
                const studentData: ParsedStudentData = {
                  student_id: getCellValue(row, columnMap.student_id),
                  full_name: getCellValue(row, columnMap.full_name),
                  email: getCellValue(row, columnMap.email),
                  date_of_birth: formatDate(getCellValue(row, columnMap.date_of_birth) || ''),
                  gender: getCellValue(row, columnMap.gender),
                  class_id: getCellValue(row, columnMap.class_id),
                  department_id: getCellValue(row, columnMap.department_id),
                  guardian_name: getCellValue(row, columnMap.guardian_name),
                  guardian_phone: formatPhoneNumber(getCellValue(row, columnMap.guardian_phone)),
                  guardian_email: getCellValue(row, columnMap.guardian_email),
                  address: getCellValue(row, columnMap.address),
                  academic_year: getCellValue(row, columnMap.academic_year) || '2024/2025'
                };

                // Basic validation (student_id will be auto-generated if empty)
                if (!studentData.full_name?.trim()) {
                  errors.push(`Row ${rowNumber}: Full name is required`);
                  return;
                }

                parsedData.push(studentData);
              } catch (error) {
                errors.push(`Row ${rowNumber}: Error parsing data - ${error}`);
              }
            });

            resolve({
              success: true,
              data: parsedData,
              errors,
              totalRows: dataRows.length,
              validRows: parsedData.length
            });

          } catch (error) {
            resolve({
              success: false,
              data: [],
              errors: [`Error parsing Excel file: ${error}`],
              totalRows: 0,
              validRows: 0
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
            totalRows: 0,
            validRows: 0
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
        totalRows: 0,
        validRows: 0
      };
    }
  };

  return {
    parseStudentFile,
    isLoading
  };
};

// Helper functions
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.includes(name.toLowerCase()));
    if (index !== -1) return index;
  }
  return -1;
}

function getCellValue(row: any[], columnIndex: number): string {
  if (columnIndex === -1 || !row[columnIndex]) return '';
  return String(row[columnIndex]).trim();
}

// Date and phone formatting moved to @/utils/dateUtils
