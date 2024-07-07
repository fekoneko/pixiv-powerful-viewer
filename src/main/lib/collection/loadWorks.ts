import { Work } from './types';
import { parseWork } from './parseWork';
import { Dirent } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';

export const loadWorks = async (
  collectionPath: string,
): Promise<[works: Work[] | undefined, errors: string[]]> => {
  let userDirents: Dirent[];
  try {
    userDirents = await readdir(collectionPath, { withFileTypes: true });
  } catch {
    return [undefined, ['Cannot find collection directory']];
  }

  const works: Work[] = [];
  const errors: string[] = [];

  await Promise.all(
    userDirents.map(async (userDirent) => {
      if (!userDirent.isDirectory()) return;

      let workDirents: Dirent[];
      try {
        workDirents = await readdir(join(userDirent.path, userDirent.name), {
          withFileTypes: true,
        });
      } catch {
        errors.push(`Cannot read works of user '${userDirent.name}'`);
        return;
      }

      await Promise.all(
        workDirents.map(async (workDirent) => {
          if (!workDirent.isDirectory()) return;

          const [work, workErrors] = await parseWork(workDirent, userDirent);
          if (work) works.push(work);
          errors.push(...workErrors);
        }),
      );
    }),
  );

  return [works, errors];
};
