import { Dirent } from 'fs';
import { toHiragana } from 'wanakana';
import CollectionList from './CollectionList';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';

let nextImageId = 0;

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

interface MetaFileProperty<T extends keyof Work = keyof Work> {
  key: T;
  isArray?: boolean;
  parser?: (readValue: string) => Work[T];
}

export type InternalOnUpdateAction = () => void;
export type InternalOnErrorAction = (error: unknown) => void;

export default class Collection {
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
  private static readonly usersInChunk = 100;

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

  private triggerOnCollectionError(error: unknown) {
    this.onCollectionErrorActions.forEach((action) => action(error));
  }

  private async loadWorksFromCollection() {
    this.worksChunks = [];
    this.triggerOnCollectionUpdate();

    // <collectionPath> \ <...userDirectories>
    const userDirectories = await window.api
      .readDir(this.path, { withFileTypes: true })
      .catch((error) => this && this.triggerOnCollectionError(error));
    if (!userDirectories || !this) return;

    const getChunk = async (userDirectories: Dirent[]) => {
      // <collectionPath> \ <...userDirectories> \ <...allUsersWorkDirectories>
      const allUsersWorkDirectories = (
        await Promise.all(
          userDirectories.map((userDirectory) =>
            window.api
              .readDir(userDirectory.path + '\\' + userDirectory.name, {
                withFileTypes: true,
              })
              .catch((error) => this && this.triggerOnCollectionError(error)),
          ),
        )
      ).filter((directory) => directory !== undefined) as Dirent[][];
      if (!this) return [];

      // <collectionPath> \ <...userDirectories> \ <...allUsersWorkDirectories> \ <...workAssets>
      const works = (
        await Promise.all(
          allUsersWorkDirectories.flatMap((userWorkDirectories, userDirectoryIndex) =>
            userWorkDirectories.map((userWorkDirectory) =>
              this.parseWork(userWorkDirectory, userDirectories[userDirectoryIndex]),
            ),
          ),
        )
      ).filter((work) => work !== undefined) as Work[];
      return works;
    };

    for (let i = 0; i < userDirectories.length; i += Collection.usersInChunk) {
      const newWorksChunk = await getChunk(userDirectories.slice(i, i + Collection.usersInChunk));
      if (!this) return;
      this.worksChunks.push(newWorksChunk!);
      this.triggerOnCollectionUpdate();
    }

    this.loaded = true;
  }

  private async parseWork(workDirectory: Dirent, userDirectory: Dirent): Promise<Work | undefined> {
    const rawAssetsWithMetaFile = await window.api
      .readDir(workDirectory.path + '\\' + workDirectory.name, {
        withFileTypes: true,
      })
      .catch((error) => this && this.triggerOnCollectionError(error));
    if (!rawAssetsWithMetaFile || !this) return undefined;

    const assetsWithMetaFile = rawAssetsWithMetaFile.map((rawAsset) => ({
      name: rawAsset.name,
      path: rawAsset.path + '\\' + rawAsset.name,
    }));

    const imageAssets: ImageAsset[] = assetsWithMetaFile
      .filter((asset) =>
        /\.jpg$|\.png$|\.gif$|\.webm$|\.webp$|\.apng$/.test(asset.name.toLowerCase()),
      )
      .sort((leftAsset, rigthAsset) => {
        const [, leftPage] = Collection.splitIntoNameAndId(leftAsset.name);
        const [, rightPage] = Collection.splitIntoNameAndId(rigthAsset.name);
        if (leftPage === undefined || rightPage === undefined) return 0;
        return leftPage - rightPage;
      })
      .map((asset) => ({
        name: asset.name,
        path: asset.path,
        mediaPath:
          'media:///' +
          encodeURI(asset.path.replaceAll('\\', '/'))
            .replaceAll('#', '%23')
            .replaceAll('&', '%26')
            .replaceAll('?', '%3F')
            .replaceAll('=', '%3D'),
        imageId: 'image-' + nextImageId++,
        imageDimensions: window.api.getImageDimensions(asset.path),
      }));

    const metaFile = assetsWithMetaFile.find((asset) =>
      /-meta\.txt$/.test(asset.name.toLowerCase()),
    );

    const [title, id] = Collection.splitIntoNameAndId(workDirectory.name);
    const [userName, userId] = Collection.splitIntoNameAndId(userDirectory.name);
    const path = workDirectory.path + '\\' + workDirectory.name;
    const workData = metaFile ? await this.getWorkDataFromMetaFile(metaFile.path) : {};

    return {
      id,
      userId,
      userName,
      title,
      path,
      assets: imageAssets,
      ...workData,
    };
  }

  private static splitIntoNameAndId(string: string): [name: string, id?: number] {
    // Format of given string: '<title> (<id>)*'
    const indexOfFirstParentheses = string.lastIndexOf('(');
    const indexOfLastParentheses = string.lastIndexOf(')');
    if (indexOfFirstParentheses === -1 || indexOfFirstParentheses >= indexOfLastParentheses)
      return [string, undefined];

    const name = string.substring(0, indexOfFirstParentheses).trim();
    const id = +string.substring(indexOfFirstParentheses + 1, indexOfLastParentheses).trim();
    return [name, id];
  }

  private static readonly metaFileProperties = new Map<string, MetaFileProperty>([
    [
      'ID',
      {
        key: 'id',
        parser: (readValue): Work['id'] => +readValue,
      },
    ],
    ['URL', { key: 'pageUrl' }],
    ['Original', { key: 'imageUrl' }],
    ['Thumbnail', { key: 'thumbnailUrl' }],
    [
      'xRestrict',
      {
        key: 'ageRestriction',
        parser: (readValue): Work['ageRestriction'] => {
          if (readValue === 'AllAges') return 'all-ages';
          else if (readValue === 'R-18') return 'r-18';
          else if (readValue === 'R-18G') return 'r-18g';
          else return undefined;
        },
      },
    ],
    [
      'AI',
      {
        key: 'ai',
        parser: (readValue): Work['ai'] =>
          readValue === 'No' ? false : readValue === 'Yes' ? true : undefined,
      },
    ],
    ['User', { key: 'userName' }],
    [
      'UserID',
      {
        key: 'userId',
        parser: (readValue): Work['userId'] => +readValue,
      },
    ],
    ['Title', { key: 'title' }],
    ['Description', { key: 'description' }],
    [
      'Tags',
      {
        key: 'tags',
        isArray: true,
        parser: (readValue) => readValue.replace('#', ''),
      },
    ],
    [
      'Size',
      {
        key: 'dimensions',
        parser: (readValue): Work['dimensions'] => {
          const splitValue = readValue.split('x');
          if (splitValue.length !== 2) return undefined;
          return { height: +splitValue[0].trim(), width: +splitValue[1].trim() };
        },
      },
    ],
    [
      'Bookmark',
      {
        key: 'bookmarks',
        parser: (readValue): Work['bookmarks'] => +readValue,
      },
    ],
    [
      'Date',
      {
        key: 'dateTime',
        parser: (readValue): Work['dateTime'] => new Date(readValue),
      },
    ],
  ]);

  private async getWorkDataFromMetaFile(metaFilePath: string) {
    const metaFileContents = await window.api
      .readFile(metaFilePath, { encoding: 'utf-8' })
      .catch((error) => this && this.triggerOnCollectionError(error));
    if (!metaFileContents || !this) return {};

    const metaFileLines = metaFileContents.split('\n');
    const workData: Partial<Work> = {};
    let currentProperty: MetaFileProperty | undefined;
    let currentIndexInProperty = 0;
    let multilinePropertyBuffer: string[] = [];

    metaFileLines.forEach((line, index) => {
      const newProperty = Collection.metaFileProperties.get(line);
      if (
        (newProperty || index === metaFileLines.length - 1) &&
        currentProperty &&
        !currentProperty.isArray
      ) {
        const readPropertyValue = multilinePropertyBuffer
          .slice(0, multilinePropertyBuffer.length - 1)
          .join('\n');
        (workData[currentProperty.key] as any) = currentProperty.parser
          ? currentProperty.parser(readPropertyValue)
          : readPropertyValue;
        multilinePropertyBuffer = [];
      }

      if (newProperty) {
        currentProperty = newProperty;
        currentIndexInProperty = 0;
      }
      if (currentProperty && currentIndexInProperty !== 0) {
        if (currentProperty.isArray) {
          if (line) {
            if (!workData[currentProperty.key]) {
              (workData[currentProperty.key] as any[] | undefined) = [];
            }
            (workData[currentProperty.key] as any[]).push(
              currentProperty.parser ? currentProperty.parser(line) : line,
            );
          }
        } else multilinePropertyBuffer.push(line);
      }
      currentIndexInProperty++;
    });

    return workData;
  }
}
