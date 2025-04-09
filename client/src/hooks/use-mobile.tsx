import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport is mobile-sized
 * @param breakpoint The width threshold in pixels (default 768px)
 * @returns Boolean indicating if the viewport is considered mobile
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if window exists (for SSR compatibility)
    if (typeof window === 'undefined') return;
    
    // Initial check
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Run initial check
    checkIfMobile();

    // Add listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup listener
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [breakpoint]);

  return isMobile;
}