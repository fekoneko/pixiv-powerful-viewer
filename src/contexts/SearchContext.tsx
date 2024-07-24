import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from 'react';

interface SearchContextValue {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

export const SearchContext = createContext({} as SearchContextValue);

export const SearchProvider = ({ children }: PropsWithChildren) => {
  const [search, setSearch] = useState<string>('');

  return <SearchContext.Provider value={{ search, setSearch }}>{children}</SearchContext.Provider>;
};
