import { invoke } from '@tauri-apps/api';
import { Work, WorkLike } from '@/types/collection';

export const writeCollectionList = async (
  collectionPath: string,
  listName: string,
  list: WorkLike[],
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
): Promise<Work[]> => {
  const relativePaths: string[] = await invoke('read_collection_list', {
    collectionPath: collectionPath,
    listName: listName,
  });

  return [...new Set(relativePaths)]
    .map((relativePath) => collectionWorks.find((work) => work.relativePath === relativePath))
    .filter((work) => work !== undefined);
};

export const isInCollectionList = (work: WorkLike, collection: WorkLike[]): boolean =>
  collection.some((collectionWork) => collectionWork.relativePath === work.relativePath);
