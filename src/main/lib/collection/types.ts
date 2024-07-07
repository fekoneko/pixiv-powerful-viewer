export type WorkAgeRestriction = 'all-ages' | 'r-18' | 'r-18g';
export type SearchMode = 'all' | 'works' | 'users';

export interface Search {
  request: string;
  mode: SearchMode;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ImageAsset {
  name: string;
  path: string;
  mediaPath: string;
  imageId: string;
  imageDimensions?: Dimensions;
}

export interface Metadata {
  title?: string;
  userName?: string;
  id?: number;
  userId?: number;
  pageUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  ageRestriction?: WorkAgeRestriction;
  ai?: boolean;
  description?: string;
  tags?: string[];
  dimensions?: Dimensions;
  bookmarks?: number;
  dateTime?: Date;
}

export interface Work extends Metadata {
  title: string;
  userName: string;
  path: string;
  assets: ImageAsset[];
}

export interface MetaFileMapValue<Key extends keyof Metadata = keyof Metadata> {
  key: Key;
  isArray?: boolean;
  parser?: (readValue: string) => Metadata[Key];
}

export interface MetaFileMap {
  [fileProperty: string]: MetaFileMapValue;
}
