import FlexSearch from 'flexsearch';
import kuromoji, { Tokenizer, IpadicFeatures } from 'kuromoji';
import { toKatakana } from 'wanakana';
import { Work, WorkKeyFields, WorkSearchableFields } from '@/types/collection';

export type MessageType = 'index' | 'search';

export type SearchWorkerRequest = {
  id: number;
  type: MessageType;
  payload: unknown;
};

export type SearchWorkerResponse = {
  id: number;
  payload: unknown | null;
  error: unknown | null;
};

type SearchIndex = FlexSearch.Document<WorkKeyFields & WorkSearchableFields>;

const createSearchIndex = async (): Promise<SearchIndex> => {
  const tokenizer = await new Promise<Tokenizer<IpadicFeatures>>((resolve, reject) =>
    kuromoji.builder({ dicPath: '/ipadic' }).build((_error, tokenizer) => {
      if (_error) return reject(_error);
      resolve(tokenizer);
    }),
  );

  const tokenize = (text: string) =>
    text.split(/[\s,.　、。]/g).flatMap((part) =>
      tokenizer.tokenize(part).map((token) => {
        if (!token.reading || token.reading === '*') return toKatakana(token.surface_form);
        return token.reading;
      }),
    );

  // TODO: add (ageRestriction, ai, bookmarks, uploadTime) search support
  return new FlexSearch.Document({
    tokenize: 'full',
    encode: tokenize,
    document: {
      id: 'relativePath',
      index: ['title', 'userName', 'tags', 'description'],
    },
  });
};

const indxWork = (searchIndex: SearchIndex, newWorks: Work[]) => {
  newWorks.forEach((work) => searchIndex.add(work.relativePath, work));
  works.push(...newWorks);
};

const searchWorks = (searchIndex: SearchIndex, query: string): Work[] => {
  const results = searchIndex.search(query);

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

const works: Work[] = [];
const searchIndexPromise = createSearchIndex();

addEventListener('message', async ({ data }: MessageEvent<SearchWorkerRequest>) => {
  try {
    const searchIndex = await searchIndexPromise;

    searchIndex.add('foo/bar/baz.md', {
      relativePath: 'foo/bar/baz.md',
      title: 'baz',
      userName: 'foo',
      tags: ['baz', 'qux'],
      description: 'baz description',
    });

    switch (data.type) {
      case 'index':
        indxWork(searchIndex, data.payload as Work[]);
        return postMessage({ id: data.id, payload: undefined, error: null });

      case 'search':
        const results = searchWorks(searchIndex, data.payload as string);
        return postMessage({ id: data.id, payload: results, error: null });
    }
  } catch (error) {
    return postMessage({ id: data.id, payload: null, error });
  }
});
