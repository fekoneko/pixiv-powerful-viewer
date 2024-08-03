import { invoke } from '@tauri-apps/api';
import { Work, WorkKeyFields, WorkSearchableFields } from '@/types/collection';
import FlexSearch, { Document } from 'flexsearch';
import { ipadicTokenizer } from '@/lib/kuromoji';
import { toKatakana } from 'wanakana';

export const readCollection = async (
  collectionPath: string,
): Promise<[works: Work[], errors: string[]]> => invoke('read_collection', { collectionPath });

// TODO: add (ageRestriction, ai, bookmarks, uploadTime) search support
export const createSearchIndex = async () => {
  const tokenizer = await ipadicTokenizer;

  const tokenize = (text: string) =>
    text.split(/[\s,.　、。]/g).flatMap((part) =>
      tokenizer.tokenize(part).map((token) => {
        let word =
          !token.reading || token.reading === '*' ? toKatakana(token.surface_form) : token.reading;
        return word;
      }),
    );

  return new FlexSearch.Document<WorkKeyFields & WorkSearchableFields>({
    tokenize: 'full',
    encode: tokenize,
    // worker: true, // TODO: fix this broken module to enable this option, duh
    document: {
      id: 'relativePath',
      index: ['title', 'userName', 'tags', 'description'],
    },
  });
};

export const indexWorks = async (
  searchIndex: Document<WorkKeyFields & WorkSearchableFields>,
  works: Work[],
) => Promise.all(works.map((work) => searchIndex.addAsync(work.relativePath, work)));

export const searchCollection = async (
  searchIndex: Document<WorkKeyFields & WorkSearchableFields>,
  works: Work[],
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
