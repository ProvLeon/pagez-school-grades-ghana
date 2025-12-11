import { useQuery } from '@tanstack/react-query';
import { calculateOverallPosition, type PositionCalculationResult } from '@/utils/positionCalculation';

interface UseOverallPositionProps {
  resultId: string;
  classId: string | null;
  academicYear: string;
  term: string;
  enabled?: boolean;
}

export function useOverallPosition({
  resultId,
  classId,
  academicYear,
  term,
  enabled = true
}: UseOverallPositionProps) {
  return useQuery({
    queryKey: ['overall-position', resultId, classId, academicYear, term],
    queryFn: () => calculateOverallPosition(resultId, classId, academicYear, term),
    enabled: enabled && !!resultId && !!classId && !!academicYear && !!term,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
}