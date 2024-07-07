import { PropsWithChildren, createContext, useCallback, useState } from 'react';
import { Collection } from '@renderer/lib/Collection';

interface CollectionContextValue {
  collection: Collection | undefined;
  loadCollection: (collectionPath: string) => void;
}

export const CollectionContext = createContext({} as CollectionContextValue);

export const CollectionProvider = ({ children }: PropsWithChildren) => {
  const [collection, setCollection] = useState<Collection>();

  const loadCollection = useCallback((collectionPath: string) => {
    setCollection(new Collection(collectionPath));
    window.api.collection
      .loadWorks(collectionPath)
      .then(([works]) => console.log('loadWorks(): ', works)); // TODO: remove
  }, []);

  return (
    <CollectionContext.Provider value={{ collection, loadCollection }}>
      {children}
    </CollectionContext.Provider>
  );
};
