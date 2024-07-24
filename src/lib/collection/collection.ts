import { Work } from './types';
import { CollectionList } from './collection-list';
import { invoke, path } from '@tauri-apps/api';

export const createCollection = async (collectionPath: string): Promise<Collection> => {
  const [works, errors]: [Work[], string[]] = await invoke('read_collection', { collectionPath });
  errors.forEach((error) => console.error(error)); // TODO: Show toast messages or something
  return new Collection(collectionPath, works);
};

export class Collection {
  public readonly path: string;
  public readonly name: string;
  public readonly favorites: CollectionList;
  public get works(): Work[] {
    return this._works;
  }

  private _works: Work[];

  constructor(collectionPath: string, works: Work[]) {
    this.path = collectionPath;
    this.name = collectionPath.split(path.sep).pop() ?? '';
    this._works = works;
    this.favorites = new CollectionList(this, 'favorites');
  }

  public search(search: string): Work[] {
    // TODO: Implement
    return this._works;
  }
}
