import { PropsWithChildren, createContext, useCallback, useRef, useState } from 'react';
import { getCollectionReader, indexWorks, searchWorks, SearchWorker } from '@/lib/collection';
import { isInCollectionList, readCollectionList, writeCollectionList } from '@/lib/collection';
import { formatTime } from '@/utils/format-time';
import { useOutput } from '@/hooks';
import { sep } from '@tauri-apps/api/path';
import { Work, WorkRelativePathField } from '@/types/collection';

export interface CollectionContextValue {
  collectionPath: string | null;
  collectionName: string | null;
  collectionWorks: Work[] | null;
  switchCollection: (collectionPath: string) => Promise<void>;
  isLoading: boolean;
  searchCollection: (query: string) => Promise<Work[] | null>;

  favorites: Work[] | null;
  addToFavorites: (work: Work) => Promise<void>;
  removeFromFavorites: (work: WorkRelativePathField) => Promise<void>;
  toggleFavorite: (work: Work) => Promise<void>;
  clearFavorites: () => Promise<void>;
  checkFavorited: (work: WorkRelativePathField) => boolean;
}

export const CollectionContext = createContext<CollectionContextValue | null>(null);

export const CollectionProvider = ({ children }: PropsWithChildren) => {
  const [collectionPath, setCollectionPath] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [collectionWorks, setCollectionWorks] = useState<Work[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Work[] | null>(null);
  const searchWorkerRef = useRef<Worker | null>(null);
  const AbortControllerRef = useRef<AbortController | null>(null);

  const { newOutput, settleOutput, logToOutput } = useOutput();

  const switchCollection = useCallback(
    async (collectionPath: string) => {
      const startTime = Date.now();

      const collectionName = collectionPath.split(sep).reverse()[0];
      setCollectionPath(collectionPath);
      setCollectionName(collectionName?.length ? collectionName : collectionPath);
      setIsLoading(true);
      newOutput();

      AbortControllerRef.current?.abort();
      AbortControllerRef.current = new AbortController();
      const signal = AbortControllerRef.current.signal;

      try {
        const collectionReader = getCollectionReader(collectionPath);

        let works: Work[] | null = null;
        setCollectionWorks(null);
        setFavorites(null);
        searchWorkerRef.current?.terminate();
        searchWorkerRef.current = new SearchWorker();

        for await (const { works: worksWithNoKey, warnings } of collectionReader()) {
          if (signal.aborted) return;

          warnings.forEach((warning) => logToOutput(warning, 'warning'));
          if (worksWithNoKey.length === 0) continue;

          const newWorks = worksWithNoKey.map((work, index) => ({
            ...work,
            key: (works?.length ?? 0) + index,
          }));

          newWorks.forEach((work) => {
            if (work.id !== null) return;
            logToOutput(`Metadata wasn't found for '${work.title}'`, 'info');
          });

          works = works ? [...works, ...newWorks] : newWorks;
          setCollectionWorks(works);

          await indexWorks(searchWorkerRef.current, newWorks);
          if (signal.aborted) return;
        }

        if (works) {
          const favorites = await readCollectionList(collectionPath, 'favorites', works);
          if (signal.aborted) return;

          if (!favorites) logToOutput('No favorites found in this collection', 'info');
          setFavorites(favorites);
        }

        setCollectionWorks((prev) => prev ?? []);
      } catch (error) {
        if (signal.aborted) return;
        const message = error instanceof Error ? error.message : String(error);
        logToOutput(message, 'error');

        setCollectionWorks(null);
        setFavorites(null);
        searchWorkerRef.current = null;
      }

      setIsLoading(false);
      const timeElapsed = Date.now() - startTime;
      logToOutput(`Setteled in ${formatTime(timeElapsed)}`, 'info');
      settleOutput();
    },
    [newOutput, settleOutput, logToOutput],
  );

  const searchCollection = useCallback(
    async (query: string) => {
      if (!collectionWorks || !searchWorkerRef.current) return null;
      if (query === '') return collectionWorks;
      if (query === '#favorites') return favorites;

      return searchWorks(searchWorkerRef.current, query);
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
      } catch {
        // TODO: showToast(error instanceof Error ? error.message : String(error));
      }
    },
    [collectionPath, isLoading, favorites],
  );

  const removeFromFavorites = useCallback(
    async (work: WorkRelativePathField) => {
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
    (work: WorkRelativePathField) => favorites !== null && isInCollectionList(work, favorites),
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
