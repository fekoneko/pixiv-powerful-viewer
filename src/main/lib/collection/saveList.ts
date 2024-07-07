import { writeFile } from 'fs/promises';
import { Work } from './types';
import { join } from 'path';

export const saveList = async (collectionPath, listName, works: Work[]): Promise<string | void> => {
  const data = works.map((work) => work.id ?? work.path).join('\n');

  try {
    await writeFile(join(collectionPath, '.' + listName), data, { encoding: 'utf-8' });
  } catch {
    return `Cannot save list '${listName}'`;
  }
};
