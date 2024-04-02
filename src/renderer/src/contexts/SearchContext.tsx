import { createContext, useState } from 'react';
import { Search } from '../lib/Collection';

interface SearchContextValue {
  search: Search | undefined;
  setSearch: React.Dispatch<React.SetStateAction<Search | undefined>>;
}
const SearchContext = createContext({} as SearchContextValue);

export const SearchProvider = ({ children }: React.PropsWithChildren) => {
  const [search, setSearch] = useState<Search>();

  return <SearchContext.Provider value={{ search, setSearch }}>{children}</SearchContext.Provider>;
};
export default SearchContext;
