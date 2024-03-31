import { useContext, useEffect, useState } from 'react';
import CollectionContext from '../contexts/CollectionContext';
import { OnError, Work } from '../lib/Collection';

const useWorks = (onError?: OnError) => {
  const { collection } = useContext(CollectionContext);
  const [works, setWorks] = useState<Work[]>([]);

  useEffect(
    () => collection?.subscribeToWorks(setWorks, onError),
    [collection],
  );

  return works;
};
export default useWorks;
