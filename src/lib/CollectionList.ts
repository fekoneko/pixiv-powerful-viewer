// TODO: Remove this stub implementation

import {
  Collection,
  CleanupFunction,
  InternalOnErrorAction,
  InternalOnUpdateAction,
  OnError,
  OnUpdate,
  Work,
} from '@/lib/Collection';

export class CollectionList {
  public name: string;

  private collection: Collection;
  private works: Work[] = [];
  private onListUpdateActions: InternalOnUpdateAction[] = [];
  private onListErrorActions: InternalOnErrorAction[] = [];

  constructor(collection: Collection, name: string) {
    this.collection = collection;
    this.name = name;
    this.loadList();
  }

  public subscribe(onUpdate: OnUpdate, onError?: OnError): CleanupFunction {
    const onUpdateAction = () => onUpdate(this.works);
    onUpdateAction();

    this.onListUpdateActions.push(onUpdateAction);
    if (onError) this.onListErrorActions.push(onError);
    return () => {
      this.onListUpdateActions = this.onListUpdateActions.filter(
        (action) => action !== onUpdateAction,
      );
      if (onError) this.onListErrorActions.filter((action) => action !== onError);
    };
  }

  public add(work: Work): void;
  public add(works: Work[]): void;

  public add(arg: Work | Work[]) {
    if (!this.includes(arg as any))
      this.works = [...this.works, ...(Array.isArray(arg) ? arg : [arg])];
    this.triggerOnListUpdate();
    this.saveList();
  }

  public remove(work: Work): void;
  public remove(works: Work[]): void;

  public remove(arg: Work | Work[]) {
    if (Array.isArray(arg)) {
      this.works = this.works.filter((work) =>
        arg.every((removedWork) =>
          removedWork.id === undefined
            ? work.path !== removedWork.path
            : work.id !== removedWork.id,
        ),
      );
    } else {
      this.works = this.works.filter((work) =>
        arg.id === undefined ? work.path !== arg.path : work.id !== arg.id,
      );
    }
    this.triggerOnListUpdate();
    this.saveList();
  }

  public clear() {
    this.works = [];
    this.triggerOnListUpdate();
    this.saveList();
  }

  public includes(work: Work) {
    return (
      this.works.findIndex((workInList) =>
        work.id === undefined ? workInList.path === work.path : workInList.id === work.id,
      ) !== -1
    );
  }

  private async loadList() {
    this.collection.subscribe(
      () => true,
      (works) => {
        this.works = works;
        this.triggerOnListUpdate();
        this.saveList();
      },
      this.triggerOnListError,
    );
  }

  private async saveList() {
    return;
  }

  private triggerOnListUpdate() {
    this.onListUpdateActions.forEach((action) => action());
  }

  private triggerOnListError(error: unknown) {
    this.onListErrorActions.forEach((action) => action(error));
  }
}
