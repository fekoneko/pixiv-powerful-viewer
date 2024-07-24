import { PropsWithChildren, createContext, useCallback, useState } from 'react';
import { Collection, createCollection } from '@/lib/collection/collection';

interface CollectionContextValue {
  collection: Collection | undefined;
  loadCollection: (collectionPath: string) => void;
}

export const CollectionContext = createContext({} as CollectionContextValue);

export const CollectionProvider = ({ children }: PropsWithChildren) => {
  const [collection, setCollection] = useState<Collection>();

  const loadCollection = useCallback(async (collectionPath: string) => {
    setCollection(await createCollection(collectionPath));
  }, []);

  return (
    <CollectionContext.Provider value={{ collection, loadCollection }}>
      {children}
    </CollectionContext.Provider>
  );
};
