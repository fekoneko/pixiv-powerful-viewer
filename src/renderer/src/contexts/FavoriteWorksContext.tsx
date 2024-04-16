import useLocalStorage from '@renderer/hooks/useLocalStorage';
import useWorks from '@renderer/hooks/useWorks';
import { Work } from '@renderer/lib/Collection';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import CollectionContext from './CollectionContext';

interface FavoriteWorksContextValue {
  favoriteWorks: Work[] | undefined;

  addToFavorites(work: Work): void;
  addToFavorites(id: number): void;
  addToFavorites(path: string): void;

  removeFromFavorites(work: Work): void;
  removeFromFavorites(id: number): void;
  removeFromFavorites(path: string): void;

  clearFavorites(): void;
}

export const FavoriteWorksContext = createContext({} as FavoriteWorksContextValue);

const FavoriteWorksProvider = ({ children }: React.PropsWithChildren) => {
  const [favoriteIdsOrPaths, setFavoriteIdsOrPaths] = useLocalStorage<(number | string)[]>(
    'favorites',
    useCallback((error) => console.error(error), []),
  );
  const { collection } = useContext(CollectionContext);
  const [favoriteWorks, setFavoriteWorks] = useState<Work[]>();
  const works = useWorks(undefined);

  useEffect(() => {
    if (!favoriteIdsOrPaths || collection?.isLoaded) return;

    const newFavoriteWorks = favoriteIdsOrPaths
      .map((idOrPath) => works.find((work) => work.id === idOrPath || work.path === idOrPath))
      .filter((work) => work !== undefined) as Work[];
    setFavoriteWorks(newFavoriteWorks);
  }, [favoriteIdsOrPaths, favoriteWorks, setFavoriteWorks, works, collection]);

  useEffect(() => {
    console.log(favoriteWorks, favoriteIdsOrPaths);
    if (!favoriteWorks || !collection?.isLoaded) return;

    const newIdsOrPaths = favoriteWorks.map((work) => work.id ?? work.path);
    setFavoriteIdsOrPaths(newIdsOrPaths);
  }, [favoriteWorks, setFavoriteIdsOrPaths, collection]);

  const addToFavorites = useCallback(
    (workOrIdOrPath: Work | number | string) => {
      setFavoriteWorks((prev) => {
        if (typeof workOrIdOrPath === 'object') {
          const filteredPrev = prev?.filter((prevWork) => prevWork.path !== workOrIdOrPath.path);
          return [...(filteredPrev ?? []), workOrIdOrPath];
        } else if (typeof workOrIdOrPath === 'number') {
          const filteredPrev = prev?.filter((prevWork) => prevWork.id !== workOrIdOrPath);
          const favoritedWork = works.find((work) => work.id === workOrIdOrPath);
          if (!favoritedWork) return filteredPrev ?? [];
          return [...(filteredPrev ?? []), favoritedWork];
        } else {
          const filteredPrev = prev?.filter((prevWork) => prevWork.path !== workOrIdOrPath);
          const favoritedWork = works.find((work) => work.path === workOrIdOrPath);
          if (!favoritedWork) return filteredPrev ?? [];
          return [...(filteredPrev ?? []), favoritedWork];
        }
      });
    },
    [setFavoriteWorks, works],
  );

  const removeFromFavorites = useCallback(
    (workOrIdOrPath: Work | number | string) => {
      setFavoriteWorks((prev) => {
        if (!prev) return [];

        if (typeof workOrIdOrPath === 'object') {
          const filteredPrev = prev.filter(
            (prevWork) =>
              (prevWork.id === undefined || prevWork.id !== workOrIdOrPath.id) &&
              prevWork.path !== workOrIdOrPath.path,
          );
          return filteredPrev;
        } else if (typeof workOrIdOrPath === 'number') {
          const filteredPrev = prev.filter((prevWork) => prevWork.id !== workOrIdOrPath);
          return filteredPrev;
        } else {
          const filteredPrev = prev.filter((prevWork) => prevWork.path !== workOrIdOrPath);
          return filteredPrev;
        }
      });
    },
    [setFavoriteWorks],
  );

  const clearFavorites = useCallback(() => setFavoriteWorks([]), [setFavoriteWorks]);

  return (
    <FavoriteWorksContext.Provider
      value={{ favoriteWorks, addToFavorites, removeFromFavorites, clearFavorites }}
    >
      {children}
    </FavoriteWorksContext.Provider>
  );
};
export default FavoriteWorksProvider;
