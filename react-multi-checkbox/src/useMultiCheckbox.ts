import type React from 'react';
import { useCallback, useState } from 'react';
import { useShiftKey } from 'lib/keyboard';
import { useKeyboardShortcuts } from 'useKeyboardShortcuts';

type ID = string;

type BaseItem = {
  id: ID;
};

type CheckboxProps = {
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

type UseMultiCheckboxOptions<TItem extends BaseItem> = {
  items: TItem[];
  keyboardTarget?: React.RefObject<HTMLElement> | HTMLElement | string | null;
};

type UseMultiCheckboxResult = {
  checkedItems: ID[];
  allChecked: boolean;
  anyChecked: boolean;
  checkAll: () => void;
  clear: () => void;
  getCheckboxProps: (id: ID) => CheckboxProps;
};

function useMultiCheckbox<TItem extends BaseItem>(options: UseMultiCheckboxOptions<TItem>): UseMultiCheckboxResult {
  const { items, keyboardTarget } = options;
  const [checkedItems, setCheckedItems] = useState<ID[]>([]);
  const [lastTouched, setLastTouched] = useState<ID | null>(null);
  const shiftKey = useShiftKey();
  const anyChecked = checkedItems.length > 0;
  const allChecked = checkedItems.length === items.length;

  const checkItems = useCallback((ids: ID[]) => {
    setCheckedItems((checkedItems) => [...new Set([...checkedItems, ...ids])]);
  }, []);

  const unCheckItems = useCallback((ids: ID[]) => {
    setCheckedItems((checkedItems) => checkedItems.filter((checkedId) => !ids.includes(checkedId)));
  }, []);

  const checkAll = useCallback(() => {
    setCheckedItems(items.map((item) => item.id));
  }, [items]);

  const clear = useCallback(() => {
    setCheckedItems([]);
  }, []);

  const createChangeHandler = useCallback(
    (id: ID) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setLastTouched(id);
      const ids = shiftKey && lastTouched ? getSelectionRange(items, id, lastTouched) : [id];
      const action = event.target.checked ? checkItems : unCheckItems;
      action(ids);
    },
    [items, shiftKey, lastTouched, checkItems, unCheckItems]
  );

  const getCheckboxProps = (id: ID) => ({
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

function getSelectionRange<TItem extends BaseItem>(items: TItem[], current: ID, lastTouched: ID): ID[] {
  const currentIndex = items.findIndex((item) => item.id === current);
  const lastIndex = items.findIndex((item) => item.id === lastTouched);
  const [start, end] = [currentIndex, lastIndex].sort((a, b) => a - b);
  return items.slice(start, end + 1).map((item) => item.id);
}

export type { UseMultiCheckboxOptions, UseMultiCheckboxResult };
export { useMultiCheckbox };
