import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ReportCardService } from '@/services/reportCardService';
import type { Database } from '@/integrations/supabase/types';

interface PublicReportSearchParams {
  studentId: string;
  academicYear: string;
  term: string;
}

export const usePublicReportSearch = () => {
  const [searchParams, setSearchParams] = useState<PublicReportSearchParams | null>(null);
  const { toast } = useToast();

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['public-report', searchParams],
    queryFn: async () => {
      if (!searchParams) return null;

      const { data, error } = await supabase
        .from('results')
        .select(`
          id,
          academic_year,
          term,
          is_public,
          students!inner(
            id,
            student_id,
            full_name,
            class_id
          ),
          classes!inner(
            id,
            name
          )
        `)
        .eq('is_public', true)
        .eq('students.student_id', searchParams.studentId)
        .eq('academic_year', searchParams.academicYear)
        .eq('term', searchParams.term)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!searchParams,
  });

  const searchReport = (params: Omit<PublicReportSearchParams, never>) => {
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchParams(null);
  };

  return {
    result,
    isLoading,
    error,
    searchReport,
    clearSearch,
  };
};

export const usePublicReportGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePublicReport = async (resultId: string) => {
    setIsGenerating(true);
    try {
      const reportData = await ReportCardService.fetchReportCardData(resultId);
      if (!reportData) {
        throw new Error('Report not found or not available');
      }

      const pdfBlob = await ReportCardService.generatePDF(reportData);
      const filename = `${reportData.student.full_name}_Report_${reportData.academic.term}_${reportData.academic.academic_year}.pdf`;

      ReportCardService.downloadPDF(pdfBlob, filename);

      toast({
        title: "Report Downloaded",
        description: `Report card has been downloaded successfully`,
      });
    } catch (error) {
      console.error('Error generating public report:', error);
      toast({
        title: "Download Failed",
        description: "Report not found or not available for download",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatePublicReport,
  };
};

export const usePublicSearchData = () => {
  // Fetch distinct academic years from published results only.
  // We no longer expose the classes table publicly — it was returning
  // classes from every organisation on the platform (multi-tenant leak).
  const { data: publishedResults = [] } = useQuery({
    queryKey: ['public-academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('results')
        .select('academic_year')
        .eq('is_public', true)
        .not('academic_year', 'is', null);

      if (error) throw error;
      return data as { academic_year: string }[];
    },
  });

  const academicYears = Array.from(
    new Set(
      publishedResults
        .map(r => r.academic_year)
        .filter((y): y is string => !!y && y.trim() !== '')
    )
  ).sort().reverse();

  const terms = ['first', 'second', 'third'];

  return {
    academicYears,
    terms,
  };
};
