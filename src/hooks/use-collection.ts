import { useContext } from 'react';
import { CollectionContext, CollectionContextValue } from '@/providers/CollectionProvider';

export const useCollection = (): CollectionContextValue => {
  const context = useContext(CollectionContext);
  if (!context) throw new Error('useCollection must be used within a CollectionProvider');

  return context;
};
