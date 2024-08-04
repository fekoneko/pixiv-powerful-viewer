import { FC, useEffect, useRef } from 'react';
import { useLocalStorage, useKeyboardEvent, useCollection } from '@/hooks';
import { dialog } from '@tauri-apps/api';
import { CollectionButtonTutorial } from '@/components/header/CollectionButtonTutorial';

export const CollectionButton: FC = () => {
  const { collectionPath, collectionName, switchCollection } = useCollection();
  const [tutorialEnabled, setTutorialEnabled] = useLocalStorage<boolean>('tutorial');
  const [recentPaths, setRecentPaths] = useLocalStorage<string[]>('recent-collections');
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
    setTutorialEnabled(false);
  }, [collectionPath, setRecentPaths, setTutorialEnabled]);

  const showPickCollectionDialog = async () => {
    const collectionPath = await dialog.open({ directory: true, multiple: false });
    if (typeof collectionPath !== 'string') return;

    switchCollection(collectionPath);
  };

  useKeyboardEvent('keydown', 'KeyO', showPickCollectionDialog, [], { control: true });
  useKeyboardEvent('keydown', 'Tab', () => recentSelectRef.current?.focus(), [recentSelectRef], {
    control: true,
  });

  return (
    <div className="relative flex min-w-0">
      <button
        onClick={showPickCollectionDialog}
        className="min-w-0 overflow-hidden whitespace-nowrap rounded-lg py-1.5 hover:bg-text-header/20 focus:bg-text-header/20 focus:outline-none"
      >
        <p className="text-overflow-mask px-2">{collectionName ?? '< Select collection >'}</p>
      </button>
      {recentPaths && (
        <div className="rounded-lg has-[:focus]:bg-text-header/20 has-[:hover]:bg-text-header/20">
          <select
            ref={recentSelectRef}
            className="mt-0.5 w-[16.5px] cursor-pointer bg-transparent [zoom:1.4] focus:outline-none"
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

      {(tutorialEnabled === null || tutorialEnabled) && <CollectionButtonTutorial />}
    </div>
  );
};
