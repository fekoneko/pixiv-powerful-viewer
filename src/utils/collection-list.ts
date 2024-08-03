import { invoke } from '@tauri-apps/api';
import { Work, WorkKeyFields } from '@/types/collection';

export const writeCollectionList = async (
  collectionPath: string,
  listName: string,
  list: WorkKeyFields[],
): Promise<void> =>
  invoke('write_collection_list', {
    collectionPath,
    listName,
    list: list.map((work) => work.relativePath),
  });

export const readCollectionList = async (
  collectionPath: string,
  listName: string,
  collectionWorks: Work[],
): Promise<Work[] | null> => {
  const relativePaths: string[] | null = await invoke('read_collection_list', {
    collectionPath: collectionPath,
    listName: listName,
  });
  if (!relativePaths) return null;

  return [...new Set(relativePaths)]
    .map((relativePath) => collectionWorks.find((work) => work.relativePath === relativePath))
    .filter((work) => work !== undefined);
};

export const isInCollectionList = (work: WorkKeyFields, collection: WorkKeyFields[]): boolean =>
  collection.some((collectionWork) => collectionWork.relativePath === work.relativePath);
