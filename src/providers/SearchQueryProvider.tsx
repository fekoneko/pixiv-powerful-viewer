import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from 'react';

export interface SearchQueryContextValue {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

export const SearchQueryContext = createContext<SearchQueryContextValue | null>(null);

export const SearchQueryProvider = ({ children }: PropsWithChildren) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <SearchQueryContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchQueryContext.Provider>
  );
};
