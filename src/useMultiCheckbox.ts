import { useCallback, useState } from 'react';

type BaseItem = {
  id: string;
};

type Options<TItem> = {
  items: TItem[];
};

type CheckboxProps = {
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

type UseMultiCheckboxResult = {
  allChecked: boolean;
  anyChecked: boolean;
  checkAll: () => void;
  clear: () => void;
  getCheckboxProps: (id: string) => CheckboxProps;
};

function useMultiCheckbox<TItem extends BaseItem>(options: Options<TItem>): UseMultiCheckboxResult {
  const { items } = options;
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const createChangeHandler = useCallback(
    (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setCheckedItems((prev) => [...prev, id]);
      } else {
        setCheckedItems((prev) => prev.filter((checkedId) => checkedId !== id));
      }
    },
    []
  );

  const getCheckboxProps = (id: string) => ({
    checked: checkedItems.includes(id),
    onChange: createChangeHandler(id),
  });

  const checkAll = () => {
    setCheckedItems(items.map((item) => item.id));
  };

  const clear = () => {
    setCheckedItems([]);
  };

  return {
    allChecked: checkedItems.length === items.length,
    anyChecked: checkedItems.length > 0,
    clear: useCallback(clear, []),
    checkAll: useCallback(checkAll, [items]),
    getCheckboxProps: useCallback(getCheckboxProps, [checkedItems, createChangeHandler]),
  };
}

export { useMultiCheckbox };
