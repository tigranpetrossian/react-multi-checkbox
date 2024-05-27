import React from 'react';
import { HistoryTable } from 'views/BrowserHistory/HistoryTable';
import { historyData } from 'views/BrowserHistory/historyData';

const BrowserHistory = () => {
  return (
    <div className="container">
      <HistoryTable history={historyData} />
    </div>
  );
};

export { BrowserHistory };
