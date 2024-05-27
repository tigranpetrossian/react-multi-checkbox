import { describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type { RenderHookResult } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useMultiCheckbox } from 'react-multi-checkbox';
import type { UseMultiCheckboxOptions, UseMultiCheckboxResult } from 'react-multi-checkbox';

type Item = { id: string; name: string };

const data: Item[] = [
  { id: '0', name: 'Zero' },
  { id: '1', name: 'One' },
  { id: '2', name: 'Two' },
  { id: '3', name: 'Three' },
  { id: '4', name: 'Four' },
  { id: '5', name: 'Five' },
  { id: '6', name: 'Six' },
  { id: '7', name: 'Seven' },
  { id: '8', name: 'Eight' },
  { id: '9', name: 'Nine' },
  { id: '10', name: 'Ten' },
];

describe('useMultiCheckbox', () => {
  const createEvent = (target: { checked: boolean }) => ({ target }) as React.ChangeEvent<HTMLInputElement>;
  let rerender: RenderHookResult<UseMultiCheckboxResult, UseMultiCheckboxOptions<Item>>['rerender'];
  let result: RenderHookResult<UseMultiCheckboxResult, UseMultiCheckboxOptions<Item>>['result'];

  beforeEach(() => {
    const rendered = renderHook(() => useMultiCheckbox({ items: data }));
    result = rendered.result;
    rerender = rendered.rerender;
  });

  it('should initialize with no items checked by default', () => {
    expect(result.current.anyChecked).toBe(false);
  });

  it('should check an item when its checkbox is clicked', () => {
    const ID = '1';
    result.current.getCheckboxProps(ID).onChange(createEvent({ checked: true }));
    rerender();
    expect(result.current.getCheckboxProps(ID).checked).toBe(true);
  });

  it('should uncheck an item when its checkbox is clicked again', () => {
    const ID = '1';
    result.current.getCheckboxProps(ID).onChange(createEvent({ checked: true }));
    rerender();
    expect(result.current.getCheckboxProps(ID).checked).toBe(true);
    result.current.getCheckboxProps(ID).onChange(createEvent({ checked: false }));
    rerender();
    expect(result.current.getCheckboxProps(ID).checked).toBe(false);
  });

  it('should check all items when checkAll is called', () => {
    result.current.checkAll();
    rerender();
    expect(result.current.allChecked).toBe(true);
  });

  it('should clear all checked items when clear is called', () => {
    result.current.checkAll();
    rerender();
    result.current.clear();
    rerender();
    expect(result.current.anyChecked).toBe(false);
  });

  it('should handle range selection with shift key', async () => {
    const FIRST_ID = '0';
    const LAST_ID = '6';
    result.current.getCheckboxProps(FIRST_ID).onChange(createEvent({ checked: true }));
    await userEvent.keyboard('{Shift>}');
    result.current.getCheckboxProps(LAST_ID).onChange(createEvent({ checked: true }));
    rerender();
    await userEvent.keyboard('{/Shift}');
    data.slice(0, 7).forEach((item) => {
      expect(result.current.getCheckboxProps(item.id).checked).toBe(true);
    });
    data.slice(7).forEach((item) => {
      expect(result.current.getCheckboxProps(item.id).checked).toBe(false);
    });
  });
});
