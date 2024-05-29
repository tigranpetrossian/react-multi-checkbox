<div align="center">
  <h1>React Multi Checkbox</h1>
</div>

## ⚠️ Work in progress
`react-multi-checkbox` is a small library for managing state of multiple checkboxes. It may or may not be published as npm package in the future.

If you come across this looking for a similar solution, the code in its current state might be useful for building your own version on top of it.

## Basic example

```js
export const data = [
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
];

const App = () => {
  const { 
    getCheckboxProps, 
    checkedItems, 
    checkAll, 
    clear, 
    allChecked, 
    anyChecked 
  } = useMultiCheckbox({ items: data });

  return (
    <ul>
      <li>
        <input
          type="checkbox"
          id="global-checkbox"
          checked={allChecked}
          onChange={(event) => (event.target.checked ? checkAll() : clear())}
        />
        <label htmlFor="global-checkbox">Toggle all</label>
      </li>
      {data.map((item) => (
        <li key={item.id}>
          <input type="checkbox" id={item.id} {...getCheckboxProps(item.id)} />
          <label htmlFor={item.id}>{item.name}</label>
        </li>
      ))}
    </ul>
  );
};
```

## Custom keyboard target
`react-multi-checkbox` supports checking all items using <kbd>Command</kbd>/<kbd>Control</kbd>+<kbd>A</kbd>, and clearing the selection using <kbd>Escape</kbd>.

By default, the target is the `window` object, but this can be customized using `keyboardTarget`.
Target can be a `RefObject`, `HTMLElement`, or a valid CSS selector. Passing `null` will disable the keyboard shortcuts entirely. This is particularly useful when the checkboxes are rendered withing modalled dialogs, preventing the <kbd>Escape</kbd> key from closing the dialog too soon.

```js
import { useRef } from 'react';

const App = () => {
  const containerRef = useRef(null);
  const { ... } = useMultiCheckbox({ items: data, keyboardTarget: containerRef });

  return (
    <div ref={containerRef}>
      ...
    </div>
  );
};
```

