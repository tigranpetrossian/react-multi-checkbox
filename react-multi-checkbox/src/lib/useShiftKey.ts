import { useEffect, useState } from 'react';

export function useShiftKey() {
  const [shiftKey, setShiftKey] = useState(false);

  useEffect(() => {
    const handleChange = (event: KeyboardEvent) => {
      setShiftKey(event.shiftKey);
    };
    window.addEventListener('keydown', handleChange);
    window.addEventListener('keyup', handleChange);

    return () => {
      window.removeEventListener('keydown', handleChange);
      window.removeEventListener('keyup', handleChange);
    };
  }, []);

  return shiftKey;
}
