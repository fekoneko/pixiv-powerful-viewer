import { useCallback, useContext, useEffect } from 'react';
import CollectionContext from '../../../contexts/CollectionContext';
import useUserData from '@renderer/hooks/useLocalStorage';

const CollectionSelector = () => {
  const { collection, loadCollection } = useContext(CollectionContext);
  const [recentPaths, setRecentPaths] = useUserData<string[]>(
    'recentCollections',
    useCallback((error) => console.error(error), []),
  );

  useEffect(() => {
    if (collection || !recentPaths?.length) return;
    loadCollection(recentPaths[0]);
  }, [loadCollection, recentPaths]);

  const switchCollection = (collectionPath: string) => {
    loadCollection(collectionPath);
    setRecentPaths((prev) => {
      if (prev) {
        const filteredPrev = prev.filter((path) => path !== collectionPath);
        return [collectionPath, ...filteredPrev];
      } else return [collectionPath];
    });
  };

  const handleSelect = async () => {
    const collectionPath = await window.api.pickDirectory();
    if (!collectionPath) return;

    switchCollection(collectionPath);
  };

  return (
    <div className="flex">
      <button
        onClick={handleSelect}
        className="whitespace-nowrap rounded-xl px-2 py-1.5 hover:bg-text-header/20 focus:bg-text-header/20 focus:outline-none"
      >
        {collection?.name ?? '< Select collection >'}
      </button>
      {recentPaths && (
        <div className="rounded-xl has-[:focus]:bg-text-header/20 has-[:hover]:bg-text-header/20">
          <select
            className="mt-0.5 w-[19px] cursor-pointer bg-transparent [zoom:1.4] focus:outline-none"
            onChange={(e) => switchCollection(recentPaths[e.target.selectedIndex])}
          >
            {recentPaths.map((path) => (
              <option key={path} className="bg-background px-3 text-text [zoom:0.65]">
                {path}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
export default CollectionSelector;
