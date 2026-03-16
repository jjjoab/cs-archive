import React, { useEffect, useRef, useState } from 'react';
import searchIcon from '../assets/icons/search.png';
import { useSearch } from '../contexts/SearchContext';
import '../App.css';

const SearchBar: React.FC = () => {
  const { query, setQuery } = useSearch();
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (active && inputRef.current) {
      inputRef.current.focus();
    }
  }, [active]);

  return (
    <div
      className="search-container"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!active ? (
        <button
          className="search-button"
          onClick={() => setActive(true)}
          aria-label="Open search"
        >
          <img src={searchIcon} alt="search" className={`search-icon ${hover ? 'hidden' : ''}`} />
          <span className={`search-placeholder ${hover ? 'visible' : ''}`}>search</span>
        </button>
      ) : (
        <div className="search-input-wrap">
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search events, titles, dates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setActive(false)}
            aria-label="Search index"
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
