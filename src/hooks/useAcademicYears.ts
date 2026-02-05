import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      try {
        // First, try to get distinct academic years from grading_settings
        const { data: settings, error: settingsError } = await supabase
          .from('grading_settings')
          .select('academic_year')
          .order('academic_year', { ascending: false });

        if (!settingsError && settings && settings.length > 0) {
          const years = Array.from(new Set(settings.map(s => s.academic_year))).sort().reverse();
          return years;
        }

        // Fallback: try to get from results table
        const { data: results, error: resultsError } = await supabase
          .from('results')
          .select('academic_year')
          .order('academic_year', { ascending: false })
          .limit(100);

        if (!resultsError && results && results.length > 0) {
          const years = Array.from(new Set(results.map(r => r.academic_year))).sort().reverse();
          return years;
        }

        // Fallback: return current and previous academic years
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        // Academic year typically starts in September (month 8)
        const academicYear = currentMonth >= 8
          ? `${currentYear}/${currentYear + 1}`
          : `${currentYear - 1}/${currentYear}`;

        const previousYear = (currentYear - 1) + '/' + currentYear;
        const twoYearsAgo = (currentYear - 2) + '/' + (currentYear - 1);

        return [academicYear, previousYear, twoYearsAgo];
      } catch (error) {
        console.error('Error fetching academic years:', error);

        // Final fallback
        const currentYear = new Date().getFullYear();
        return [`${currentYear}/${currentYear + 1}`, `${currentYear - 1}/${currentYear}`, `${currentYear - 2}/${currentYear - 1}`];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
