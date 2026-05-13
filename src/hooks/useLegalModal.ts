import { useEffect, useState, useCallback } from 'react';

type LegalType = 'privacy' | 'terms' | null;

interface UseLegalModalReturn {
  isOpen: boolean;
  type: LegalType;
  openPrivacy: () => void;
  openTerms: () => void;
  close: () => void;
}

/**
 * Hook to manage legal modal state globally
 * Listens for custom events from AppSidebar and other components
 */
export function useLegalModal(): UseLegalModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<LegalType>(null);

  const openPrivacy = useCallback(() => {
    setType('privacy');
    setIsOpen(true);
  }, []);

  const openTerms = useCallback(() => {
    setType('terms');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setType(null);
  }, []);

  // Listen for custom events from sidebar
  useEffect(() => {
    const handleOpenModal = (event: Event): void => {
      const customEvent = event as CustomEvent<{ type: string }>;
      const { type } = customEvent.detail;
      if (type === 'privacy') {
        openPrivacy();
      } else if (type === 'terms') {
        openTerms();
      }
    };

    window.addEventListener('openLegalModal', handleOpenModal);
    return () => {
      window.removeEventListener('openLegalModal', handleOpenModal);
    };
  }, [openPrivacy, openTerms]);

  return {
    isOpen,
    type,
    openPrivacy,
    openTerms,
    close,
  };
}
