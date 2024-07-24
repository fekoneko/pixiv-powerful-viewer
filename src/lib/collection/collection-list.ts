import { Work, WorkLike } from './types';
import { Collection } from './collection';

export class CollectionList {
  public readonly name: string;
  public get works(): Work[] {
    return this._works;
  }

  private _collection: Collection;
  private _works: Work[];

  constructor(collection: Collection, name: string) {
    this._collection = collection;
    this.name = name;
    this._works = this.getWorks();
  }

  public async add(...works: Work[]): Promise<void> {
    this._works = [...this._works, ...works];
    await this.saveList();
  }

  public async remove(...works: WorkLike[]): Promise<void> {
    this._works = this._works.filter((currentWork) =>
      works.every((work) => work.relativePath !== currentWork.relativePath),
    );
    await this.saveList();
  }

  public async clear(): Promise<void> {
    this._works = [];
    await this.saveList();
  }

  public includes(...works: WorkLike[]): boolean {
    return works.every(
      (work) =>
        this._works.findIndex((workInList) => work.relativePath === workInList.relativePath) !== -1,
    );
  }

  private getWorks(): Work[] {
    // TODO: Implement
    return this._collection.works;
  }

  private async saveList(): Promise<void> {
    // TODO: Implement
    return;
  }
}
