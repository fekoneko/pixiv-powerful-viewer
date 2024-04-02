import { useContext, useEffect, useState } from 'react';
import CollectionContext from '../contexts/CollectionContext';
import { OnError, Search, Work } from '../lib/Collection';

const useWorks = (search: Search | undefined, onError?: OnError) => {
  const { collection } = useContext(CollectionContext);
  const [works, setWorks] = useState<Work[]>([]);

  useEffect(() => {
    return collection?.subscribeToWorks(search, setWorks, onError);
  }, [collection, search, onError]);

  return works;
};
export default useWorks;
