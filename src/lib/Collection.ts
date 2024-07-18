// TODO: Remove this stub implementation

import { toHiragana } from 'wanakana';
import { CollectionList } from '@/lib/CollectionList';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';

export type WorkAgeRestriction = 'all-ages' | 'r-18' | 'r-18g';

export type SearchMode = 'all' | 'works' | 'users';

export interface Search {
  request: string;
  mode: SearchMode;
}

export interface ImageAsset {
  name: string;
  path: string;
  mediaPath: string;
  imageId: string;
  imageDimensions: ISizeCalculationResult;
}

export interface Work {
  path: string;
  title: string;
  userName: string;
  id?: number;
  userId?: number;
  pageUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  ageRestriction?: WorkAgeRestriction;
  ai?: boolean;
  description?: string;
  tags?: string[];
  dimensions?: { width: number; height: number };
  bookmarks?: number;
  dateTime?: Date;
  assets?: ImageAsset[];
}

export type OnUpdate = (works: Work[]) => void;
export type OnError = (error: unknown) => void;
export type CleanupFunction = () => void;

export type InternalOnUpdateAction = () => void;
export type InternalOnErrorAction = (error: unknown) => void;

export class Collection {
  public readonly path: string;
  public readonly name: string;
  public get isLoaded() {
    return this.loaded;
  }
  public favorites: CollectionList;

  private worksChunks: Work[][] = [];
  private loaded = false;
  private onCollectionUpdateActions: InternalOnUpdateAction[] = [];
  private onCollectionErrorActions: InternalOnErrorAction[] = [];

  constructor(collectionPath: string) {
    this.path = collectionPath;
    const splittedPath = collectionPath.split('\\');
    this.name = splittedPath[splittedPath.length - 1];
    this.loadWorksFromCollection();
    this.favorites = new CollectionList(this, 'favorites');
  }

  public subscribe(
    search: Search | undefined,
    onUpdate: OnUpdate,
    onError?: OnError,
  ): CleanupFunction;
  public subscribe(
    predicate: (work: Work) => boolean,
    onUpdate: OnUpdate,
    onError?: OnError,
  ): CleanupFunction;
  public subscribe(
    searchOrPredicate: Search | ((work: Work) => boolean) | undefined,
    onUpdate: OnUpdate,
    onError?: OnError,
  ) {
    const searchedChunks: Work[][] = [];

    let onUpdateAction: () => void;
    if (typeof searchOrPredicate === 'function') {
      onUpdateAction = () => {
        // Search only new chunks
        const newSearchedChunks = this.worksChunks
          .slice(searchedChunks.length)
          .map((works) => works.filter(searchOrPredicate));

        searchedChunks.push(...newSearchedChunks);
        onUpdate(searchedChunks.flat());
      };
    } else {
      onUpdateAction = () => {
        if (!searchOrPredicate?.request) {
          const works = this.worksChunks.flat();
          onUpdate(works);
          return;
        }

        const searchKeywords = searchOrPredicate.request
          .split(',')
          .map((keyword) =>
            keyword
              .trim()
              .split(' ')
              .map((keyword) => keyword.split('　').map((keyword) => keyword.split('、'))),
          )
          .flat(3)
          .map((keyword) => toHiragana(keyword, { passRomaji: true }).toLowerCase());

        const checkProperties = (properties: (string | string[] | undefined)[]) =>
          searchKeywords.every((keyword) => {
            return properties.some((property) => {
              if (!property) return false;
              if (typeof property === 'object') {
                return property.some((item) =>
                  toHiragana(item, { passRomaji: true }).toLowerCase().includes(keyword),
                );
              } else {
                return toHiragana(property, { passRomaji: true }).toLowerCase().includes(keyword);
              }
            });
          });

        // Search only new chunks
        const newSearchedChunks = this.worksChunks.slice(searchedChunks.length).map((works) => {
          let results: Work[] = works;
          if (searchOrPredicate.mode === 'all') {
            results = results.filter((work) =>
              checkProperties([
                work.title,
                work.tags,
                work.userName,
                work.description,
                work.id?.toString(),
                work.userId?.toString(),
              ]),
            );
          }
          if (searchOrPredicate.mode === 'users') {
            results = results.filter((work) =>
              checkProperties([work.userName, work.userId?.toString()]),
            );
          } else if (searchOrPredicate.mode === 'works') {
            results = results.filter((work) =>
              checkProperties([work.title, work.description, work.tags, work.id?.toString()]),
            );
          }
          return results;
        });
        searchedChunks.push(...newSearchedChunks);
        onUpdate(searchedChunks.flat());
      };
    }
    onUpdateAction();

    this.onCollectionUpdateActions.push(onUpdateAction);
    if (onError) this.onCollectionErrorActions.push(onError);
    return () => {
      this.onCollectionUpdateActions = this.onCollectionUpdateActions.filter(
        (action) => action !== onUpdateAction,
      );
      if (onError) this.onCollectionErrorActions.filter((action) => action !== onError);
    };
  }

  private triggerOnCollectionUpdate() {
    this.onCollectionUpdateActions.forEach((action) => action());
  }

  private async loadWorksFromCollection() {
    this.worksChunks = [
      [
        {
          path: 'test',
          title: 'test',
          userName: 'test',
          id: 0,
          userId: 0,
          pageUrl: 'test',
          imageUrl: 'test',
          thumbnailUrl: 'test',
          ageRestriction: 'all-ages',
          ai: false,
          description: 'test',
          tags: ['test'],
          dimensions: { width: 10, height: 10 },
          bookmarks: 0,
          dateTime: new Date(),
        },
      ],
    ];
    this.loaded = true;
    this.triggerOnCollectionUpdate();
  }
}
