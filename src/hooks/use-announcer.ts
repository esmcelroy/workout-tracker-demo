import { useEffect, useRef } from 'react';

/**
 * Hook for announcing messages to screen reader users
 * Uses aria-live region to make dynamic updates accessible
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live announcer element if it doesn't exist
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.setAttribute('role', 'status');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      // Clean up on unmount
      if (announcerRef.current && announcerRef.current.parentNode) {
        announcerRef.current.parentNode.removeChild(announcerRef.current);
      }
    };
  }, []);

  const announce = (message: string, assertive = false) => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute(
        'aria-live',
        assertive ? 'assertive' : 'polite'
      );
      announcerRef.current.textContent = message;
    }
  };

  return { announce };
}
