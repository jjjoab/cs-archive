import React from 'react';
import './index.css';

interface HeaderProps {
  currentPage: 'japan' | 'svg' | 'corsica';
  setCurrentPage: (page: 'japan' | 'svg' | 'corsica') => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  const handleToggle = () => {
    const pages = ['japan', 'svg', 'corsica'] as const;
    const currentIndex = pages.indexOf(currentPage);
    const nextIndex = (currentIndex + 1) % pages.length;
    setCurrentPage(pages[nextIndex]);
  };

  return (
    <div className="header">
      <button 
        onClick={handleToggle}
        className="logo-container"
        title="Toggle between grids"
      >
        <span className="toggle-label">
          {currentPage === 'japan' ? 'Japan Grid' : currentPage === 'svg' ? 'SVG Grid' : 'Corsica'}
        </span>
      </button>
      <nav className="nav-links">
        <button 
          onClick={() => setCurrentPage('japan')}
          className={`nav-item ${currentPage === 'japan' ? 'active' : ''}`}
          title="Japan Grid"
        >
          <span className="label">Japan Grid</span>
        </button>

        <button 
          onClick={() => setCurrentPage('svg')}
          className={`nav-item ${currentPage === 'svg' ? 'active' : ''}`}
          title="SVG Grid"
        >
          <span className="label">SVG Grid</span>
        </button>

        <button 
          onClick={() => setCurrentPage('corsica')}
          className={`nav-item ${currentPage === 'corsica' ? 'active' : ''}`}
          title="Corsica"
        >
          <span className="label">Corsica</span>
        </button>
      </nav>
    </div>
  );
};

export default Header;
