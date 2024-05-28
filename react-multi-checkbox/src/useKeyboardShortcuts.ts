import type { KeyboardEvent } from 'react';
import type React from 'react';
import { useEffect } from 'react';
import type { UseMultiCheckboxOptions } from 'useMultiCheckbox';
import { isMac } from 'lib/platform';

type KeyboardShortcut = {
  key: string;
  handler: () => void;
  modifiers?: {
    cmdOrCtrlKey?: boolean;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  };
};

type UseKeyboardShortcutsOptions = {
  shortcuts: KeyboardShortcut[];
  target?: string | HTMLElement | React.RefObject<HTMLElement> | null;
};

function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const { shortcuts, target } = options;

  useEffect(() => {
    const targetElement = getKeyboardTargetElement(target);
    if (!targetElement) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcuts) => {
        if (event.key === shortcuts.key && modifiersMatchExactly(event, shortcuts.modifiers)) {
          event.preventDefault();
          shortcuts.handler();
        }
      });
    };

    // @ts-expect-error: lands on wrong addEventListener overload due to targetElement being a union. Appears to be a typings bug/limitation.
    targetElement.addEventListener('keydown', handleKeyDown);

    return () => {
      // @ts-expect-error: lands on wrong addEventListener overload due to targetElement being a union. Appears to be a typings bug/limitation.
      targetElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [target, shortcuts]);
}

function modifiersMatchExactly(event: KeyboardEvent, modifiers: KeyboardShortcut['modifiers'] = {}) {
  const normalizedModifiers = {
    cmdOrCtrlKey: false,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    ...modifiers,
  };

  return (
    event.shiftKey === normalizedModifiers.shiftKey &&
    (event.ctrlKey === normalizedModifiers.ctrlKey || (normalizedModifiers.cmdOrCtrlKey && !isMac())) &&
    (event.metaKey === normalizedModifiers.metaKey || (normalizedModifiers.cmdOrCtrlKey && isMac())) &&
    event.altKey === normalizedModifiers.altKey
  );
}

function getKeyboardTargetElement(target: UseMultiCheckboxOptions['keyboardTarget']): HTMLElement | Window | null {
  if (target === undefined) {
    return window;
  }

  if (target === null || target instanceof HTMLElement) {
    return target;
  }

  if (typeof target === 'string') {
    const queryResult = document.querySelector(target);
    return queryResult instanceof HTMLElement ? queryResult : null;
  }

  return target.current;
}

export { useKeyboardShortcuts };
