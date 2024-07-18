import { useContext, useEffect, useState } from 'react';
import { CollectionContext } from '@/contexts/CollectionContext';
import { OnError, Search, Work } from '@/lib/Collection';

interface UseWorks {
  (search?: Search, onError?: OnError): Work[];
  (predicate: (work: Work) => boolean, onError?: OnError): Work[];
}

export const useWorks: UseWorks = (arg?: any, onError?: OnError) => {
  const { collection } = useContext(CollectionContext);
  const [works, setWorks] = useState<Work[]>([]);

  useEffect(() => {
    if (arg?.request === '#favorites') return collection?.favorites.subscribe(setWorks, onError);
    else return collection?.subscribe(arg, setWorks, onError);
  }, [collection, arg, onError]);

  return works;
};
