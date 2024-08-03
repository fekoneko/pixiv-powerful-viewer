import { useContext } from 'react';
import { SearchQueryContext, SearchQueryContextValue } from '@/providers/SearchQueryProvider';

export const useSearchQuery = (): SearchQueryContextValue => {
  const context = useContext(SearchQueryContext);
  if (!context) throw new Error('useSearchQuery must be used within SearchQueryProvider');

  return context;
};
