
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ReportCardService, ReportCardData } from '@/services/reportCardService';

export const useReportCardData = (resultId: string) => {
  return useQuery({
    queryKey: ['report-card', resultId],
    queryFn: () => ReportCardService.fetchReportCardData(resultId),
    enabled: !!resultId,
  });
};

export const useReportCards = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSingleReport = async (resultId: string) => {
    setIsGenerating(true);
    try {
      const reportData = await ReportCardService.fetchReportCardData(resultId);
      if (!reportData) {
        throw new Error('Failed to fetch report data');
      }

      const pdfBlob = await ReportCardService.generatePDF(reportData);
      const filename = `${reportData.student.full_name}_Report_${reportData.academic.term}_${reportData.academic.academic_year}.pdf`;
      
      ReportCardService.downloadPDF(pdfBlob, filename);
      
      toast({
        title: "Report Generated",
        description: `Report card for ${reportData.student.full_name} has been downloaded`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBulkReports = async (classId: string, term: string, academicYear: string) => {
    setIsGenerating(true);
    try {
      // Get all students in the class
      const { data: students, error } = await supabase
        .from('students')
        .select('id, full_name')
        .eq('class_id', classId)
        .eq('has_left', false);

      if (error) throw error;
      if (!students || students.length === 0) {
        throw new Error('No students found in this class');
      }

      const studentIds = students.map(s => s.id);
      const reports = await ReportCardService.generateBulkReports(studentIds, term, academicYear);
      
      // For bulk download, we could zip them or download individually
      reports.forEach((blob, index) => {
        const studentName = students[index]?.full_name || `Student_${index + 1}`;
        const filename = `${studentName}_Report_${term}_${academicYear}.pdf`;
        setTimeout(() => {
          ReportCardService.downloadPDF(blob, filename);
        }, index * 500); // Stagger downloads
      });

      toast({
        title: "Reports Generated",
        description: `${reports.length} report cards have been generated and downloaded`,
      });
    } catch (error) {
      console.error('Error generating bulk reports:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate bulk reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateSingleReport,
    generateBulkReports
  };
};
