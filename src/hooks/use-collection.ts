import { CollectionContext, CollectionContextValue } from '@/contexts/CollectionContext';
import { useContext } from 'react';

export const useCollection = (): CollectionContextValue => {
  const context = useContext(CollectionContext);
  if (!context) throw new Error('useCollection must be used within a CollectionProvider');

  return context;
};
