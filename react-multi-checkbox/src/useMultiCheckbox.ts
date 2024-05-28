import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { primaryModifierPressed, useShiftKey } from 'lib/keyboard';

type BaseItem = {
  id: string;
};

type CheckboxProps = {
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

type UseMultiCheckboxOptions<TItem extends BaseItem = BaseItem> = {
  items: TItem[];
  keyboardTarget?: React.RefObject<HTMLElement> | HTMLElement | string | null;
};

type UseMultiCheckboxResult = {
  allChecked: boolean;
  anyChecked: boolean;
  checkAll: () => void;
  clear: () => void;
  getCheckboxProps: (id: string) => CheckboxProps;
};

function useMultiCheckbox<TItem extends BaseItem>(options: UseMultiCheckboxOptions<TItem>): UseMultiCheckboxResult {
  const { items, keyboardTarget } = options;
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [lastTouched, setLastTouched] = useState<string | null>(null);
  const shiftKey = useShiftKey();
  const anyChecked = checkedItems.length > 0;
  const allChecked = checkedItems.length === items.length;

  const checkAll = useCallback(() => {
    setCheckedItems(items.map((item) => item.id));
  }, [items]);

  const clear = useCallback(() => {
    setCheckedItems([]);
  }, []);

  const handleSingleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setCheckedItems((checkedItems) => [...checkedItems, id]);
    } else {
      setCheckedItems((checkedItems) => checkedItems.filter((checkedId) => checkedId !== id));
    }
  };

  const handleRangeChange = (range: string[], checked: boolean) => {
    if (checked) {
      setCheckedItems((prev) => [...new Set([...prev, ...range])]);
    } else {
      setCheckedItems((prev) => prev.filter((checkedId) => !range.includes(checkedId)));
    }
  };

  const createChangeHandler = useCallback(
    (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setLastTouched(id);

      if (shiftKey && lastTouched) {
        const range = getSelectionRange(items, id, lastTouched);
        handleRangeChange(range, event.target.checked);
      } else {
        handleSingleCheckboxChange(id, event.target.checked);
      }
    },
    [items, shiftKey, lastTouched]
  );

  const getCheckboxProps = (id: string) => ({
    checked: checkedItems.includes(id),
    onChange: createChangeHandler(id),
  });

  useKeyboard(keyboardTarget, checkAll, clear, checkedItems);

  return {
    allChecked,
    anyChecked,
    clear,
    checkAll,
    getCheckboxProps: useCallback(getCheckboxProps, [checkedItems, createChangeHandler]),
  };
}

function getKeyboardTargetElement(target: UseMultiCheckboxOptions['keyboardTarget']): Element | Window | null {
  if (target === undefined) {
    return window;
  }

  if (target === null || target instanceof HTMLElement) {
    return target;
  }

  if (typeof target === 'string') {
    return document.querySelector(target);
  }

  return target.current;
}

function getSelectionRange<TItem extends BaseItem>(items: TItem[], current: string, lastTouched: string): string[] {
  const currentIndex = items.findIndex((item) => item.id === current);
  const lastIndex = items.findIndex((item) => item.id === lastTouched);
  const [start, end] = [currentIndex, lastIndex].sort((a, b) => a - b);
  return items.slice(start, end + 1).map((item) => item.id);
}

function useKeyboard(
  target: UseMultiCheckboxOptions['keyboardTarget'],
  checkAll: () => void,
  clear: () => void,
  checkedItems: string[]
) {
  useEffect(() => {
    const targetElement = getKeyboardTargetElement(target);

    if (!targetElement) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'a' && primaryModifierPressed(event)) {
        event.preventDefault();
        checkAll();
      }

      if (event.key === 'Escape' && checkedItems.length > 0) {
        event.preventDefault();
        clear();
      }
    };

    // Union target incorrectly lands on a wrong overload for `addEventListener`, causing errors.
    (targetElement as HTMLElement).addEventListener('keydown', handleKeyDown);
    return () => {
      (targetElement as HTMLElement).removeEventListener('keydown', handleKeyDown);
    };
  }, [checkedItems, target, checkAll, clear]);
}

export type { UseMultiCheckboxOptions, UseMultiCheckboxResult };
export { useMultiCheckbox };
