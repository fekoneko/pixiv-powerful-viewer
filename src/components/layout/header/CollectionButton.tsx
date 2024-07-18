import { FC, useCallback, useContext, useEffect, useRef } from 'react';
import { CollectionContext } from '@/contexts/CollectionContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useKeyboardEvent } from '@/hooks/useKeyboardEvent';

export const CollectionButton: FC = () => {
  const { collection, loadCollection } = useContext(CollectionContext);
  const [recentPaths, setRecentPaths] = useLocalStorage<string[]>(
    'recentCollections',
    useCallback((error: unknown) => console.error(error), []),
  );
  const recentSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (collection || !recentPaths?.length) return;
    loadCollection(recentPaths[0]);
  }, [loadCollection, recentPaths, collection]);

  const switchCollection = (collectionPath: string) => {
    loadCollection(collectionPath);
    setRecentPaths((prev) => {
      if (prev) {
        const filteredPrev = prev.filter((path) => path !== collectionPath);
        return [collectionPath, ...filteredPrev];
      } else return [collectionPath];
    });
  };

  const showPickCollectionDialog = async () => {
    const collectionPath = 'C:\\Test'; // TODO: await pickDirectory();
    if (!collectionPath) return;

    switchCollection(collectionPath);
  };

  useKeyboardEvent('keyup', 'KeyO', showPickCollectionDialog, [], { control: true });
  useKeyboardEvent(
    'keyup',
    'Tab',
    () => recentSelectRef.current?.focus(),
    [recentSelectRef.current],
    { control: true },
  );

  return (
    <div className="flex">
      <button
        onClick={showPickCollectionDialog}
        className="whitespace-nowrap rounded-xl px-2 py-1.5 hover:bg-text-header/20 focus:bg-text-header/20 focus:outline-none"
      >
        {collection?.name ?? '< Select collection >'}
      </button>
      {recentPaths && (
        <div className="rounded-xl has-[:focus]:bg-text-header/20 has-[:hover]:bg-text-header/20">
          <select
            ref={recentSelectRef}
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
