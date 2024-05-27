import React, { useEffect, useRef } from 'react';
import type { HistoryData } from 'types';
import { useMultiCheckbox } from 'react-multi-checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shadcn/ui/table';

type Props = {
  history: HistoryData;
};

const HistoryTable = (props: Props) => {
  const { history } = props;
  const globalCheckboxRef = useRef<HTMLInputElement>(null);
  const { allChecked, anyChecked, checkAll, clear, getCheckboxProps } = useMultiCheckbox({
    items: history,
  });

  useEffect(() => {
    if (!globalCheckboxRef.current) {
      return;
    }

    globalCheckboxRef.current.indeterminate = anyChecked && !allChecked;
  }, [anyChecked, allChecked]);

  const handleGlobalCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      checkAll();
    } else {
      clear();
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">
            <input ref={globalCheckboxRef} type="checkbox" checked={allChecked} onChange={handleGlobalCheckboxChange} />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <input type="checkbox" {...getCheckboxProps(item.id)} />
            </TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.url}</TableCell>
            {/*<TableCell className="text-right">{invoice.totalAmount}</TableCell>*/}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export { HistoryTable };
