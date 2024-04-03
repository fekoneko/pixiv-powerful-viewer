import { createContext, useCallback, useState } from 'react';
import Collection from '../lib/Collection';

interface CollectionContextValue {
  collection: Collection | undefined;
  loadCollection: (collectionPath: string) => void;
}
const CollectionContext = createContext({} as CollectionContextValue);

export const CollectionProvider = ({ children }: React.PropsWithChildren) => {
  const [collection, setCollection] = useState<Collection>();

  const loadCollection = useCallback(
    (collectionPath: string) => {
      setCollection(new Collection(collectionPath));
    },
    [setCollection],
  );

  return (
    <CollectionContext.Provider value={{ collection, loadCollection }}>
      {children}
    </CollectionContext.Provider>
  );
};
export default CollectionContext;
