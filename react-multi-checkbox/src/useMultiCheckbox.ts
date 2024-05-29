import type React from 'react';
import { useCallback, useState } from 'react';
import { useShiftKey } from 'lib/keyboard';
import { useKeyboardShortcuts } from 'useKeyboardShortcuts';

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
  checkedItems: string[];
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

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'a',
        handler: checkAll,
        modifiers: { cmdOrCtrlKey: true },
      },
      {
        key: 'Escape',
        handler: clear,
      },
    ],
    target: keyboardTarget,
  });

  return {
    allChecked,
    anyChecked,
    checkedItems,
    clear,
    checkAll,
    getCheckboxProps: useCallback(getCheckboxProps, [checkedItems, createChangeHandler]),
  };
}

function getSelectionRange<TItem extends BaseItem>(items: TItem[], current: string, lastTouched: string): string[] {
  const currentIndex = items.findIndex((item) => item.id === current);
  const lastIndex = items.findIndex((item) => item.id === lastTouched);
  const [start, end] = [currentIndex, lastIndex].sort((a, b) => a - b);
  return items.slice(start, end + 1).map((item) => item.id);
}

export type { UseMultiCheckboxOptions, UseMultiCheckboxResult };
export { useMultiCheckbox };
