import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from 'react';
import { Search } from '@/lib/Collection';

interface SearchContextValue {
  search: Search | undefined;
  setSearch: Dispatch<SetStateAction<Search | undefined>>;
}

export const SearchContext = createContext({} as SearchContextValue);

export const SearchProvider = ({ children }: PropsWithChildren) => {
  const [search, setSearch] = useState<Search>();

  return <SearchContext.Provider value={{ search, setSearch }}>{children}</SearchContext.Provider>;
};
