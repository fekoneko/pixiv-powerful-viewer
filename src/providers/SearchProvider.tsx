import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from 'react';

export interface SearchContextValue {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

export const SearchContext = createContext<SearchContextValue | null>(null);

export const SearchProvider = ({ children }: PropsWithChildren) => {
  const [search, setSearch] = useState<string>('');

  return <SearchContext.Provider value={{ search, setSearch }}>{children}</SearchContext.Provider>;
};
