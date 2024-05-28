import type React from 'react';
import { useEffect, useState } from 'react';
import { isMac } from 'lib/platform';

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

export function primaryModifierPressed(event: KeyboardEvent | React.KeyboardEvent) {
  return isMac() ? event.metaKey : event.ctrlKey;
}
