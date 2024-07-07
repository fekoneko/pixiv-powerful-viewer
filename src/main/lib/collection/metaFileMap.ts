import { Metadata, MetaFileMap } from './types';

export const metaFileMap: Readonly<MetaFileMap> = {
  ID: {
    key: 'id',
    parser: (readValue): Metadata['id'] => +readValue,
  },
  URL: { key: 'pageUrl' },
  Original: { key: 'imageUrl' },
  Thumbnail: { key: 'thumbnailUrl' },
  xRestrict: {
    key: 'ageRestriction',
    parser: (readValue): Metadata['ageRestriction'] => {
      if (readValue === 'AllAges') return 'all-ages';
      else if (readValue === 'R-18') return 'r-18';
      else if (readValue === 'R-18G') return 'r-18g';
      else return undefined;
    },
  },
  AI: {
    key: 'ai',
    parser: (readValue): Metadata['ai'] =>
      readValue === 'No' ? false : readValue === 'Yes' ? true : undefined,
  },
  User: { key: 'userName' },
  UserID: {
    key: 'userId',
    parser: (readValue): Metadata['userId'] => +readValue,
  },
  Title: { key: 'title' },
  Description: { key: 'description' },
  Tags: {
    key: 'tags',
    isArray: true,
    parser: (readValue): NonNullable<Metadata['tags']>[0] => readValue.replace('#', ''),
  },
  Size: {
    key: 'dimensions',
    parser: (readValue): Metadata['dimensions'] => {
      const splitValue = readValue.split('x');
      if (splitValue.length !== 2) return undefined;
      return { height: +splitValue[0].trim(), width: +splitValue[1].trim() };
    },
  },
  Bookmark: {
    key: 'bookmarks',
    parser: (readValue): Metadata['bookmarks'] => +readValue,
  },
  Date: {
    key: 'dateTime',
    parser: (readValue): Metadata['dateTime'] => new Date(readValue),
  },
};
