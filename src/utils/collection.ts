import { Work } from '../types/collection';
import { invoke } from '@tauri-apps/api';

export const readCollection = async (
  collectionPath: string,
): Promise<[works: Work[], errors: string[]]> => invoke('read_collection', { collectionPath });

// TODO: Implement better search
export const searchCollection = (collection: Work[], query: string): Work[] =>
  collection.filter((work) => work.title.toLowerCase().includes(query.toLowerCase()));
