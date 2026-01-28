import React, { useState } from 'react';
import Header from './Header';
import Corsica from './Corsica';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'japan' | 'svg' | 'corsica'>('japan');

  return (
    <>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="main-content">
         <Corsica />
      </div>
    </>
  );
};

export default App;
