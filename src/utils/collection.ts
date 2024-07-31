import { invoke } from '@tauri-apps/api';
import { Work } from '@/types/collection';
import FlexSearch, { Document } from 'flexsearch';

export const readCollection = async (
  collectionPath: string,
): Promise<[works: Work[], errors: string[]]> => invoke('read_collection', { collectionPath });

// TODO: add (ageRestriction, ai, bookmarks, uploadTime) search support
export const createSearchIndex = () =>
  new FlexSearch.Document<Work>({
    document: {
      id: 'relativePath',
      index: [
        { field: 'title', tokenize: 'full' },
        { field: 'tags', tokenize: 'full' },
        { field: 'userName', tokenize: 'full' },
        { field: 'description', tokenize: 'full' },
      ],
    },
  });

export const searchCollection = async (
  works: Work[],
  searchIndex: Document<Work>,
  query: string,
): Promise<Work[]> => {
  const results = await searchIndex.searchAsync(query);

  return works
    .map((work): [Work, number] => {
      const frequency = results.reduce(
        (occurences, { result }) =>
          result.includes(work.relativePath) ? occurences + 1 : occurences,
        0,
      );
      return [work, frequency];
    })
    .filter(([, frequency]) => frequency > 0)
    .sort(([, leftFrequency], [, rightFrequency]) => rightFrequency - leftFrequency)
    .map(([work]) => work);
};
