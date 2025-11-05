import { useEffect } from "react";
import { useLocation } from "wouter";

export function useKeyboardShortcuts() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            setLocation('/');
            break;
          case 'f':
            e.preventDefault();
            setLocation('/forecast');
            break;
          case 'h':
            e.preventDefault();
            setLocation('/health');
            break;
          case 'c':
            e.preventDefault();
            setLocation('/compare');
            break;
          case 't':
            e.preventDefault();
            setLocation('/trends');
            break;
          case 'r':
            e.preventDefault();
            window.location.reload();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setLocation]);
}
