
import { useState, useEffect, useMemo } from "react";
import { calculateTotalScore, getGradeFromScale } from "@/utils/gradeCalculations";

export const useSubjectMarksManager = (classSubjects: any[], selectedSBAType: any, gradingScales: any[]) => {
  const [subjectMarks, setSubjectMarks] = useState<Record<string, any>>({});

  // Memoize class subjects IDs to prevent unnecessary re-renders
  const subjectIds = useMemo(() => 
    classSubjects.map(subject => subject.id).sort().join(','), 
    [classSubjects]
  );

  // Initialize subject marks when class subjects change
  useEffect(() => {
    if (classSubjects.length > 0) {
      const initialMarks: Record<string, any> = {};
      classSubjects.forEach(subject => {
        initialMarks[subject.id] = {
          subject_id: subject.id,
          subject_name: subject.name,
          ca1_score: undefined,
          ca2_score: undefined,
          ca3_score: undefined,
          ca4_score: undefined,
          exam_score: undefined,
          total_score: 0,
          grade: 'F'
        };
      });
      setSubjectMarks(initialMarks);
      console.log('Initialized subject marks for subjects:', subjectIds);
    } else {
      setSubjectMarks({});
    }
  }, [subjectIds]); // Use memoized subjectIds instead of classSubjects

  // Update total scores and grades when SBA type or grading scales change
  useEffect(() => {
    if (selectedSBAType && gradingScales.length > 0 && Object.keys(subjectMarks).length > 0) {
      const updatedMarks = { ...subjectMarks };
      let hasChanges = false;
      
      Object.keys(updatedMarks).forEach(subjectId => {
        const marks = updatedMarks[subjectId];
        const totalScore = calculateTotalScore(marks, selectedSBAType);
        const grade = getGradeFromScale(totalScore, gradingScales);
        
        if (marks.total_score !== totalScore || marks.grade !== grade) {
          updatedMarks[subjectId] = {
            ...marks,
            total_score: totalScore,
            grade: grade
          };
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setSubjectMarks(updatedMarks);
        console.log('Updated total scores and grades');
      }
    }
  }, [selectedSBAType?.id, gradingScales.length]); // Use specific dependencies

  return {
    subjectMarks,
    setSubjectMarks
  };
};
