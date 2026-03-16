import React, { createContext, useContext, useEffect, useState } from 'react';

interface SearchContextType {
  query: string;
  setQuery: (q: string) => void;
  setQueryImmediate: (q: string) => void;
  debouncedQuery: string;
}

const SearchContext = createContext<SearchContextType>({
  query: '',
  setQuery: () => {},
  setQueryImmediate: () => {},
  debouncedQuery: ''
});

export const SearchProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 1000);
    return () => clearTimeout(t);
  }, [query]);

  const setQueryImmediate = (q: string) => {
    setQuery(q);
    setDebouncedQuery(q);
  };

  return (
    <SearchContext.Provider value={{ query, setQuery, setQueryImmediate, debouncedQuery }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);

export default SearchContext;
