import { Dirent } from 'fs';
import { toHiragana } from 'wanakana';

export type WorkAgeRestriction = 'all-ages' | 'r-18' | 'r-18g';

export type SearchMode = 'all' | 'works' | 'users';

export interface Search {
  request: string;
  mode: SearchMode;
}

export interface WorkAsset {
  name: string;
  path: string;
  mediaPath: string;
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
  dimensions?: { h: number; v: number };
  bookmarks?: number;
  dateTime?: Date;
  assets?: WorkAsset[];
}

export type OnUpdate = (works: Work[]) => any;
export type OnError = OnErrorAction;
export type CleanupFunction = () => void;

interface MetaFileProperty<T extends keyof Work = keyof Work> {
  key: T;
  isArray?: boolean;
  parser?: (readValue: string) => Work[T];
}

type OnUpdateAction = () => any;
type OnErrorAction = (error: unknown) => any;

export default class Collection {
  public readonly path: string;
  public readonly name: string;

  private worksChunks: Work[][] = [];
  private onUpdateActions: OnUpdateAction[] = [];
  private onErrorActions: OnErrorAction[] = [];
  private static readonly usersInChunk = 50;

  constructor(collectionPath: string) {
    this.path = collectionPath;
    const splittedPath = collectionPath.split('\\');
    this.name = splittedPath[splittedPath.length - 1];
    this.loadWorksFromCollection();
  }

  public subscribeToWorks(
    search: Search | undefined,
    onUpdate: OnUpdate,
    onError?: OnError,
  ): CleanupFunction {
    const searchedChunks: Work[][] = [];
    const onUpdateAction = () => {
      if (!search?.request) {
        const works = this.worksChunks.flat();
        onUpdate(works);
        return;
      }

      const searchKeywords = search.request
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
        if (search.mode === 'all') {
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
        if (search.mode === 'users') {
          results = results.filter((work) =>
            checkProperties([work.userName, work.userId?.toString()]),
          );
        } else if (search.mode === 'works') {
          results = results.filter((work) =>
            checkProperties([work.title, work.description, work.tags, work.id?.toString()]),
          );
        }
        return results;
      });
      searchedChunks.push(...newSearchedChunks);
      onUpdate(searchedChunks.flat());
    };
    onUpdateAction();

    this.onUpdateActions.push(onUpdateAction);
    if (onError) this.onErrorActions.push(onError);
    return () => {
      this.onUpdateActions.filter((action) => action !== onUpdateAction);
      if (onError) this.onErrorActions.filter((action) => action !== onError);
    };
  }

  private triggerOnError(error: unknown) {
    this.onErrorActions.forEach((action) => action(error));
  }

  private triggerOnUpdate() {
    this.onUpdateActions.forEach((action) => action());
  }

  private async loadWorksFromCollection() {
    this.worksChunks = [];
    this.triggerOnUpdate();

    // <collectionPath> \ <...userDirectories>
    const userDirectories = await window.api
      .readDir(this.path, { withFileTypes: true })
      .catch((error) => this && this.triggerOnError(error));
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
              .catch((error) => this && this.triggerOnError(error)),
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
      this.triggerOnUpdate();
    }
  }

  private async parseWork(workDirectory: Dirent, userDirectory: Dirent): Promise<Work | undefined> {
    const rawAssetsWithMetaFile = await window.api
      .readDir(workDirectory.path + '\\' + workDirectory.name, {
        withFileTypes: true,
      })
      .catch((error) => this && this.triggerOnError(error));
    if (!rawAssetsWithMetaFile || !this) return undefined;

    const assetsWithMetaFile: WorkAsset[] = rawAssetsWithMetaFile.map((rawAsset) => ({
      name: rawAsset.name,
      path: rawAsset.path + '\\' + rawAsset.name,
      mediaPath:
        'media:///' +
        encodeURI((rawAsset.path + '/' + rawAsset.name).replaceAll('\\', '/'))
          .replaceAll('#', '%23')
          .replaceAll('&', '%26')
          .replaceAll('?', '%3F')
          .replaceAll('=', '%3D'),
    }));

    const assets = assetsWithMetaFile
      .filter((asset) =>
        /\.jpg$|\.png$|\.gif$|\.webm$|\.webp$|\.apng$/.test(asset.name.toLowerCase()),
      )
      .sort((leftAsset, rigthAsset) => {
        const [, leftPage] = Collection.splitIntoNameAndId(leftAsset.name);
        const [, rightPage] = Collection.splitIntoNameAndId(rigthAsset.name);
        if (leftPage === undefined || rightPage === undefined) return 0;
        return leftPage - rightPage;
      });

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
      assets,
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
          return { h: +splitValue[0].trim(), v: +splitValue[1].trim() };
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
    const metaFileBuffer = await window.api
      .readFile(metaFilePath, { encoding: 'utf-8' })
      .catch((error) => this && this.triggerOnError(error));
    if (!metaFileBuffer || !this) return {};

    const metaFileContents = metaFileBuffer.split('\n');
    const workData: Partial<Work> = {};
    let currentProperty: MetaFileProperty | undefined;
    let currentIndexInProperty = 0;
    let multilinePropertyBuffer: string[] = [];

    metaFileContents.forEach((line) => {
      const newProperty = Collection.metaFileProperties.get(line);
      if (newProperty) {
        if (currentProperty && !currentProperty.isArray) {
          const readPropertyValue = multilinePropertyBuffer
            .slice(0, multilinePropertyBuffer.length - 1)
            .join('\n');
          (workData[currentProperty.key] as any) = currentProperty.parser
            ? currentProperty.parser(readPropertyValue)
            : readPropertyValue;
          multilinePropertyBuffer = [];
        }

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
