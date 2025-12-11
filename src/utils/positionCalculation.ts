import { supabase } from '@/lib/supabase';

export interface PositionCalculationResult {
  position: string;
  totalStudents: number;
}

/**
 * Calculate overall position for a student within their class
 * Uses the same logic as the PDF report generation
 */
export async function calculateOverallPosition(
  resultId: string, 
  classId: string | null, 
  academicYear: string, 
  term: string
): Promise<PositionCalculationResult> {
  try {
    if (!classId) {
      console.log('No class ID provided for position calculation');
      return { position: '', totalStudents: 0 };
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
      return { position: '', totalStudents: 0 };
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
      return { position: '', totalStudents: 0 };
    }

    console.log(`Found ${studentsWithTotalScores.length} students with scores for position calculation`);

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
        const position = getOrdinalPosition(currentPosition);
        console.log(`Student ${resultId} position: ${position} (total score: ${score})`);
        return { 
          position, 
          totalStudents: studentsWithTotalScores.length 
        };
      }
      
      // Skip positions for tied students
      currentPosition += studentsWithScore.length;
    }

    console.log(`Student ${resultId} not found in any position group`);
    return { position: '', totalStudents: studentsWithTotalScores.length };
  } catch (error) {
    console.error('Error calculating overall position:', error);
    return { position: '', totalStudents: 0 };
  }
}

/**
 * Convert number to ordinal format (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalPosition(position: number): string {
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