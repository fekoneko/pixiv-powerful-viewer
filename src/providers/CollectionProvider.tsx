import { PropsWithChildren, createContext, useCallback, useRef, useState } from 'react';
import { createSearchIndex, readCollection } from '@/utils/collection';
import { searchCollection as searchCollectionUtil } from '@/utils/collection';
import { isInCollectionList } from '@/utils/collection-list';
import { readCollectionList, writeCollectionList } from '@/utils/collection-list';
import { useOutput } from '@/hooks';
import { sep } from '@tauri-apps/api/path';
import { Work, WorkLike } from '@/types/collection';
import { Document } from 'flexsearch';

export interface CollectionContextValue {
  collectionPath: string | null;
  collectionName: string | null;
  collectionWorks: Work[] | null;
  switchCollection: (collectionPath: string) => Promise<void>;
  isLoading: boolean;
  searchCollection: (query: string) => Promise<Work[] | null>;

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
  const searchIndexRef = useRef<Document<Work> | null>(null);
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
        const [works, warnings] = await readCollection(collectionPath);
        setCollectionWorks(works);
        warnings.forEach((warning) => logToOutput(warning, 'warning'));

        const favorites = await readCollectionList(collectionPath, 'favorites', works);
        setFavorites(favorites);
        if (!favorites) logToOutput('No favorites found in this collection', 'info');

        searchIndexRef.current = createSearchIndex();
        works.forEach((work) => searchIndexRef.current?.add(work)); // TODO: addAsync

        updateOutputStatus('success');
      } catch (error) {
        setCollectionWorks(null);
        setFavorites(null);
        searchIndexRef.current = null;

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
    async (query: string) => {
      if (!collectionWorks || !searchIndexRef.current) return null;
      if (query === '') return collectionWorks;
      if (query === '#favorites') return favorites;

      return searchCollectionUtil(collectionWorks, searchIndexRef.current, query);
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
      } catch {
        // TODO: showToast(error instanceof Error ? error.message : String(error));
        // TODO: actually it would make sense to put it in the same output as the collection loading,
        // but change title or something to indicate that error occured, idk
      }
    },
    [collectionPath, isLoading, favorites],
  );

  const clearFavorites = useCallback(async () => {
    try {
      if (collectionPath === null || isLoading) throw new Error('Collection is not loaded');

      setFavorites([]);
      await writeCollectionList(collectionPath, 'favorites', []);
    } catch {
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
