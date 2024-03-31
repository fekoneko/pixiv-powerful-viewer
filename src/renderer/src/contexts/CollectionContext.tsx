import { createContext, useReducer } from 'react';
import Collection from '../lib/Collection';

interface CollectionContextValue {
  collection: Collection | null;
  loadCollection: React.Dispatch<string>;
}
const CollectionContext = createContext({} as CollectionContextValue);

export const CollectionProvider = ({ children }: React.PropsWithChildren) => {
  const [collection, loadCollection] = useReducer(
    (_prev: Collection | null, collectionPath: string): Collection | null =>
      new Collection(collectionPath),
    null,
  );

  return (
    <CollectionContext.Provider value={{ collection, loadCollection }}>
      {children}
    </CollectionContext.Provider>
  );
};
export default CollectionContext;
