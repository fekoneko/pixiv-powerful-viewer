import { invoke } from '@tauri-apps/api';
import { toHiragana } from 'wanakana';
import { Work } from '@/types/collection';

export const readCollection = async (
  collectionPath: string,
): Promise<[works: Work[], errors: string[]]> => invoke('read_collection', { collectionPath });

// TODO: Implement better search
export const searchCollection = (collectionWorks: Work[], query: string): Work[] => {
  if (!query) return collectionWorks;

  const searchKeywords = query
    .split(',')
    .map((keyword) =>
      keyword
        .trim()
        .split(' ')
        .map((keyword) => keyword.split('　').map((keyword) => keyword.split('、'))),
    )
    .flat(3)
    .map((keyword) => toHiragana(keyword, { passRomaji: true }).toLowerCase());

  const checkProperties = (properties: (string | string[] | null)[]) =>
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

  return collectionWorks.filter((work) =>
    checkProperties([
      work.title,
      work.tags,
      work.userName,
      work.description,
      work.id?.toString() ?? null,
      work.userId?.toString() ?? null,
    ]),
  );
};
