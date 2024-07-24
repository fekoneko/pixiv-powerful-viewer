import { useContext, useMemo } from 'react';
import { CollectionContext } from '@/contexts/CollectionContext';
import { Work } from '@/lib/collection';

export const useWorks = (search?: string): Work[] | undefined => {
  const { collection } = useContext(CollectionContext);

  const works = useMemo(() => {
    if (!search) return collection?.works;
    if (search === '#favorites') return collection?.favorites.works;
    return collection?.search(search);
  }, [collection, search]);

  return works;
};
