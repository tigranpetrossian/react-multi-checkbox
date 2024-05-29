import { describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, renderHook, type RenderHookResult } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UseMultiCheckboxOptions, UseMultiCheckboxResult } from '../src';
import { useMultiCheckbox } from '../src';
import type { DataItem } from './fixtures';
import { data } from './fixtures';

describe('useMultiCheckbox', () => {
  const createEvent = (target: { checked: boolean }) => ({ target }) as React.ChangeEvent<HTMLInputElement>;
  let rerender: RenderHookResult<UseMultiCheckboxResult, UseMultiCheckboxOptions<DataItem>>['rerender'];
  let result: RenderHookResult<UseMultiCheckboxResult, UseMultiCheckboxOptions<DataItem>>['result'];

  beforeEach(() => {
    const rendered = renderHook(() => useMultiCheckbox({ items: data }));
    result = rendered.result;
    rerender = rendered.rerender;
  });

  it('should initialize with no items checked', () => {
    expect(result.current.anyChecked).toBe(false);
    expect(result.current.checkedItems).toHaveLength(0);
  });

  it('should check an unchecked item', () => {
    const ID = '1';
    result.current.getCheckboxProps(ID).onChange(createEvent({ checked: true }));
    rerender();
    expect(result.current.checkedItems).toContain(ID);
    expect(result.current.getCheckboxProps(ID).checked).toBe(true);
  });

  it('should uncheck a checked item', () => {
    const ID = '1';
    result.current.getCheckboxProps(ID).onChange(createEvent({ checked: true }));
    rerender();
    expect(result.current.getCheckboxProps(ID).checked).toBe(true);
    result.current.getCheckboxProps(ID).onChange(createEvent({ checked: false }));
    rerender();
    expect(result.current.getCheckboxProps(ID).checked).toBe(false);
    expect(result.current.checkedItems).not.toContain(ID);
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
});

describe('interactions', () => {
  const List = () => {
    const { getCheckboxProps, allChecked, checkAll, clear } = useMultiCheckbox({ items: data });

    return (
      <>
        <div>
          <input
            type="checkbox"
            id="global-checkbox"
            checked={allChecked}
            onChange={(event) => (event.target.checked ? checkAll() : clear())}
          />
          <label htmlFor="global-checkbox">Toggle all</label>
        </div>
        {data.map((item) => (
          <div key={item.id}>
            <input type="checkbox" id={item.id} {...getCheckboxProps(item.id)} />
            <label htmlFor={item.id}>{item.name}</label>
          </div>
        ))}
      </>
    );
  };

  describe('given a list of checkboxes', () => {
    it('when shift-clicking an unchecked checkbox, should check all items between the last touched item and the current', async () => {
      const { getByLabelText, getAllByLabelText } = render(<List />);
      const startingCheckbox = getByLabelText('One');
      const endingCheckbox = getByLabelText('Five');

      await userEvent.click(startingCheckbox);
      await userEvent.keyboard('{Shift>}');
      await userEvent.click(endingCheckbox);
      await userEvent.keyboard('{/Shift}');
      getAllByLabelText(/One|Two|Three|Four|Five/).forEach((checkbox) => expect(checkbox).toBeChecked());
    });

    it('when shift-clicking a checked checkbox, should uncheck all items between the last touched item and the current', async () => {
      const { getByLabelText, getAllByLabelText } = render(<List />);
      const globalCheckbox = getByLabelText('Toggle all');
      const startingCheckbox = getByLabelText('One');
      const endingCheckbox = getByLabelText('Five');

      await userEvent.click(globalCheckbox);
      await userEvent.click(startingCheckbox);
      await userEvent.keyboard('{Shift>}');
      await userEvent.click(endingCheckbox);
      await userEvent.keyboard('{/Shift}');
      getAllByLabelText(/One|Two|Three|Four|Five/).forEach((checkbox) => expect(checkbox).not.toBeChecked());
      getAllByLabelText(/Zero|Six|Seven|Eight|Nine|Ten/).forEach((checkbox) => expect(checkbox).toBeChecked());
    });

    it('when cmd/ctrl + a is pressed, should check all items', async () => {
      const { getAllByRole } = render(<List />);
      await userEvent.keyboard('{Control>}a{/Control}');
      getAllByRole('checkbox').forEach((checkbox) => expect(checkbox).toBeChecked());
    });

    it('when escape is pressed, should uncheck all items', async () => {
      const { getByLabelText, getAllByRole } = render(<List />);
      const globalCheckbox = getByLabelText('Toggle all');

      await userEvent.click(globalCheckbox);
      await userEvent.keyboard('{Escape}');
      getAllByRole('checkbox').forEach((checkbox) => expect(checkbox).not.toBeChecked());
    });
  });
});
