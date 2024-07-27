import { FC, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useKeyboardEvent } from '@/hooks/use-keyboard-event';
import { dialog } from '@tauri-apps/api';
import { useCollection } from '@/hooks/use-collection';

export const CollectionButton: FC = () => {
  const { collectionPath, collectionName, switchCollection } = useCollection();
  const [recentPaths, setRecentPaths] = useLocalStorage<string[]>(
    'recentCollections',
    console.error,
  );
  const recentSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (!recentPaths || recentPaths.length === 0 || collectionName !== null) return;
    switchCollection(recentPaths[0]);
  }, [recentPaths, collectionName, switchCollection]);

  useEffect(() => {
    if (!collectionPath) return;

    setRecentPaths((prev) => {
      if (prev) {
        const filteredPrev = prev.filter((path) => path !== collectionPath);
        return [collectionPath, ...filteredPrev];
      } else return [collectionPath];
    });
  }, [collectionPath, setRecentPaths]);

  const showPickCollectionDialog = async () => {
    const collectionPath = await dialog.open({ directory: true, multiple: false });
    if (typeof collectionPath !== 'string') return;

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
        {collectionName ?? '< Select collection >'}
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
