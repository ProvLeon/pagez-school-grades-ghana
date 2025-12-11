
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { schoolSettingsService } from '@/services/schoolSettingsService';
import { applyThemeColor } from '@/utils/themeUtils';
import { SchoolSettings, AcademicSession, AcademicTerm } from '@/types/schoolSettings';

export const useSchoolSettings = () => {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [currentSession, setCurrentSession] = useState<AcademicSession | null>(null);
  const [currentTerm, setCurrentTerm] = useState<AcademicTerm | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const data = await schoolSettingsService.fetchSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching school settings:', error);
      toast({
        title: "Error",
        description: "Failed to load school settings",
        variant: "destructive",
      });
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await schoolSettingsService.fetchSessions();
      setSessions(data);
      const current = data.find((session: AcademicSession) => session.is_current);
      setCurrentSession(current || null);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchTerms = async () => {
    try {
      const data = await schoolSettingsService.fetchTerms();
      setTerms(data);
      const current = data.find((term: AcademicTerm) => term.is_current);
      setCurrentTerm(current || null);
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  const updateSettings = async (updates: Partial<SchoolSettings>) => {
    try {
      const data = await schoolSettingsService.updateSettings(updates);
      setSettings(data);
      
      // Apply theme changes immediately if primary_color was updated
      if (updates.primary_color) {
        applyThemeColor(updates.primary_color);
      }

      return data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const createSession = async (sessionName: string) => {
    try {
      await schoolSettingsService.createSession(sessionName);
      await Promise.all([fetchSessions(), fetchTerms()]);

      toast({
        title: "Session Created",
        description: `Academic session "${sessionName}" has been created`,
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
      throw error;
    }
  };

  const switchSession = async (sessionId: string) => {
    try {
      await schoolSettingsService.switchSession(sessionId);
      await Promise.all([fetchSessions(), fetchTerms()]);

      toast({
        title: "Session Switched",
        description: "Academic session has been successfully changed",
      });
    } catch (error) {
      console.error('Error switching session:', error);
      toast({
        title: "Error",
        description: "Failed to switch session",
        variant: "destructive",
      });
    }
  };

  const switchTerm = async (termName: string) => {
    try {
      if (!currentSession) return;

      await schoolSettingsService.switchTerm(currentSession.id, termName);
      await fetchTerms();
      
      toast({
        title: "Term Switched",
        description: `Current term changed to ${termName}`,
      });
    } catch (error) {
      console.error('Error switching term:', error);
      toast({
        title: "Error",
        description: "Failed to switch term",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSettings(), fetchSessions(), fetchTerms()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Apply theme color on load
  useEffect(() => {
    if (settings?.primary_color) {
      applyThemeColor(settings.primary_color);
    }
  }, [settings?.primary_color]);

  return {
    settings,
    sessions,
    terms,
    currentSession,
    currentTerm,
    loading,
    updateSettings,
    createSession,
    switchSession,
    switchTerm,
    refetch: () => Promise.all([fetchSettings(), fetchSessions(), fetchTerms()])
  };
};

// Export types for backward compatibility
export type { SchoolSettings, AcademicSession, AcademicTerm };
