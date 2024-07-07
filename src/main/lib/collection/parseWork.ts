import { ImageAsset, Metadata, MetaFileMapValue, Work } from './types';
import { metaFileMap } from './metaFileMap';
import { Dirent } from 'fs';
import { getImageDimensions } from '../image-size';
import { readdir, readFile } from 'fs/promises';
import { join, sep } from 'path';

interface File {
  name: string;
  fullPath: string;
}

let nextImageId = 0;

const splitIntoNameAndId = (string: string): [name: string, id?: number] => {
  const indexOfFirstParentheses = string.lastIndexOf('(');
  const indexOfLastParentheses = string.lastIndexOf(')');
  if (indexOfFirstParentheses === -1 || indexOfFirstParentheses >= indexOfLastParentheses)
    return [string, undefined];

  const name = string.substring(0, indexOfFirstParentheses).trim();
  const id = +string.substring(indexOfFirstParentheses + 1, indexOfLastParentheses).trim();
  return [name, id];
};

const getImageAssets = async (
  workFiles: File[],
): Promise<[imageAssets: ImageAsset[], errors: string[]]> => {
  const errors: string[] = [];

  const imageAssetsPromises = workFiles
    .filter(
      (file) => /\.jpg$|\.png$|\.gif$|\.webm$|\.webp$|\.apng$/.test(file.name.toLowerCase()),
      `q`,
    )
    .sort((leftAsset, rigthAsset) => {
      const [, leftPage] = splitIntoNameAndId(leftAsset.name);
      const [, rightPage] = splitIntoNameAndId(rigthAsset.name);
      if (leftPage === undefined || rightPage === undefined) return 0;
      return leftPage - rightPage;
    })
    .map(async (asset) => ({
      name: asset.name,
      path: asset.fullPath,
      mediaPath:
        'media:///' +
        encodeURI(asset.fullPath.replaceAll(sep, '/'))
          .replaceAll('#', '%23')
          .replaceAll('&', '%26')
          .replaceAll('?', '%3F')
          .replaceAll('=', '%3D'),
      imageId: 'image-' + nextImageId++,
      imageDimensions: await getImageDimensions(asset.fullPath).catch(() => {
        errors.push(`Cannot read image dimensions of '${asset.fullPath}'`);
        return undefined;
      }),
    }));

  return [await Promise.all(imageAssetsPromises), errors];
};

const getMetadata = async (
  workFiles: File[],
): Promise<[metadata: Metadata | undefined, errors: string[]]> => {
  const metaFile = workFiles.find((asset) => /-meta\.txt$/.test(asset.name.toLowerCase()));
  if (!metaFile) return [undefined, []];

  let metaFileContents: string;
  try {
    metaFileContents = await readFile(metaFile.fullPath, { encoding: 'utf-8' });
  } catch {
    return [undefined, [`Cannot read meta file '${metaFile.fullPath}'`]];
  }

  const metaFileLines = metaFileContents.split('\n');
  const metadata: any = {};

  let mapValue: MetaFileMapValue | undefined;
  let offsetInProperty = 0;
  let multilinePropertyBuffer: string[] = [];

  metaFileLines.forEach((fileLine, offsetInFile) => {
    const newMapValue = metaFileMap[fileLine.trim()];
    if (
      (newMapValue || offsetInFile === metaFileLines.length - 1) &&
      mapValue &&
      !mapValue.isArray
    ) {
      const readValue = multilinePropertyBuffer
        .slice(0, multilinePropertyBuffer.length - 1)
        .join('\n');
      metadata[mapValue.key] = mapValue.parser ? mapValue.parser(readValue) : readValue;
      multilinePropertyBuffer = [];
    }

    if (newMapValue) {
      mapValue = newMapValue;
      offsetInProperty = 0;
    }
    if (mapValue && offsetInProperty !== 0) {
      if (mapValue.isArray) {
        if (fileLine) {
          if (!metadata[mapValue.key]) metadata[mapValue.key] = [];
          metadata[mapValue.key].push(mapValue.parser ? mapValue.parser(fileLine) : fileLine);
        }
      } else multilinePropertyBuffer.push(fileLine);
    }
    offsetInProperty++;
  });

  return [metadata, []];
};

export const parseWork = async (
  workDirent: Dirent,
  userDirent: Dirent,
): Promise<[work: Work | undefined, errors: string[]]> => {
  const workPath = join(workDirent.path, workDirent.name);

  let workFilenames: string[];
  try {
    workFilenames = await readdir(workPath);
  } catch {
    return [undefined, [`Cannot parse work '${workDirent.name}' of user '${userDirent.name}'`]];
  }

  const workFiles: File[] = workFilenames.map((filename) => ({
    name: filename,
    fullPath: join(workPath, filename),
  }));

  const [[assets, assetsErrors], [metadata, metadataErrors]] = await Promise.all([
    getImageAssets(workFiles),
    getMetadata(workFiles),
  ]);

  const [title, id] = splitIntoNameAndId(workDirent.name);
  const [userName, userId] = splitIntoNameAndId(userDirent.name);
  const path = join(workDirent.path, workDirent.name);

  return [
    {
      id,
      userId,
      userName,
      title,
      path,
      assets,
      ...(metadata ?? {}),
    },
    [...assetsErrors, ...metadataErrors],
  ];
};
