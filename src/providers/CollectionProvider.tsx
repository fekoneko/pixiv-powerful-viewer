import { PropsWithChildren, createContext, useCallback, useState } from 'react';
import { readCollection as readCollectionUtil } from '@/utils/collection';
import { searchCollection as searchCollectionUtil } from '@/utils/collection';
import { isInCollectionList } from '@/utils/collection-list';
import { readCollectionList, writeCollectionList } from '@/utils/collection-list';
import { sep } from '@tauri-apps/api/path';
import { Work, WorkLike } from '@/types/collection';
import { useOutput } from '@/hooks';

export interface CollectionContextValue {
  collectionPath: string | null;
  collectionName: string | null;
  collectionWorks: Work[] | null;
  switchCollection: (collectionPath: string) => Promise<void>;
  isLoading: boolean;
  searchCollection: (query: string) => Work[] | null;

  favorites: Work[] | null;
  addToFavorites: (work: Work) => Promise<void>;
  removeFromFavorites: (work: WorkLike) => Promise<void>;
  toggleFavorite: (work: Work) => Promise<void>;
  clearFavorites: () => Promise<void>;
  checkFavorited: (work: WorkLike) => boolean;
}

export const CollectionContext = createContext<CollectionContextValue | null>(null);

export const CollectionProvider = ({ children }: PropsWithChildren) => {
  const [collectionPath, setCollectionPath] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [collectionWorks, setCollectionWorks] = useState<Work[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Work[] | null>(null);
  const { newOutput, updateOutputStatus, logToOutput } = useOutput();

  const switchCollection = useCallback(
    async (collectionPath: string) => {
      const collectionName = collectionPath.split(sep).reverse()[0];

      setCollectionPath(collectionPath);
      setCollectionName(collectionName);

      setIsLoading(true);
      newOutput({
        pendingMessage: 'Loading collection...',
        successMessage: 'Collection loaded',
        errorMessage: 'Failed to load collection',
      });

      try {
        const [works, warnings] = await readCollectionUtil(collectionPath);
        setCollectionWorks(works);
        warnings.forEach((warning) => logToOutput(warning, 'warning'));

        const favorites = await readCollectionList(collectionPath, 'favorites', works);
        setFavorites(favorites);
        console.log(favorites);
        if (!favorites) logToOutput('No favorites found in this collection', 'info');

        updateOutputStatus('success');
      } catch (error) {
        setCollectionWorks(null);
        setFavorites(null);

        const message = error instanceof Error ? error.message : String(error);
        logToOutput(message, 'error');
        updateOutputStatus('error');
      } finally {
        setIsLoading(false);
      }
    },
    [newOutput, updateOutputStatus, logToOutput],
  );

  const searchCollection = useCallback(
    (query: string) => {
      if (!collectionWorks) return null;
      if (query === '#favorites') return favorites;

      return searchCollectionUtil(collectionWorks, query);
    },
    [collectionWorks, favorites],
  );

  const addToFavorites = useCallback(
    async (work: Work) => {
      try {
        if (collectionPath === null || isLoading) throw new Error('Collection is not loaded');

        const newFavorites = [
          ...(favorites?.filter(
            (favoriteWork) => favoriteWork.relativePath !== work.relativePath,
          ) ?? []),
          work,
        ];

        setFavorites(newFavorites);
        await writeCollectionList(collectionPath, 'favorites', newFavorites);
      } catch (error) {
        // TODO: showToast(error instanceof Error ? error.message : String(error));
      }
    },
    [collectionPath, isLoading, favorites],
  );

  const removeFromFavorites = useCallback(
    async (work: WorkLike) => {
      try {
        if (collectionPath === null || isLoading) throw new Error('Collection is not loaded');

        const newFavorites =
          favorites?.filter((favoriteWork) => favoriteWork.relativePath !== work.relativePath) ??
          [];

        setFavorites(newFavorites);
        await writeCollectionList(collectionPath, 'favorites', newFavorites);
      } catch (error) {
        // TODO: showToast(error instanceof Error ? error.message : String(error));
      }
    },
    [collectionPath, isLoading, favorites],
  );

  const clearFavorites = useCallback(async () => {
    try {
      if (collectionPath === null || isLoading) throw new Error('Collection is not loaded');

      setFavorites([]);
      await writeCollectionList(collectionPath, 'favorites', []);
    } catch (error) {
      // TODO: showToast(error instanceof Error ? error.message : String(error));
    }
  }, [collectionPath, isLoading]);

  const checkFavorited = useCallback(
    (work: WorkLike) => favorites !== null && isInCollectionList(work, favorites),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (work: Work) => {
      if (checkFavorited(work)) return removeFromFavorites(work);
      else return addToFavorites(work);
    },
    [checkFavorited, addToFavorites, removeFromFavorites],
  );

  return (
    <CollectionContext.Provider
      value={{
        collectionPath,
        collectionName,
        collectionWorks,
        switchCollection,
        isLoading,
        searchCollection,

        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        clearFavorites,
        checkFavorited,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};
