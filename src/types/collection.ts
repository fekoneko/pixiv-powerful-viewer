export type AgeRestriction = 'all-ages' | 'r-18' | 'r-18g';

export interface Work {
  key: number;
  path: string;
  relativePath: string;
  title: string;
  userName: string;
  imageAssets: Asset[];
  novelAsset: Asset;

  id: number | null;
  userId: number | null;
  url: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  ageRestriction: AgeRestriction | null;
  ai: boolean | null;
  description: string | null;
  tags: string[] | null;
  dimensions: ImageDimensions | null;
  bookmarks: number | null;
  uploadTime: string | null;
}

export interface Asset {
  name: string;
  path: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface WorkRelativePathField {
  relativePath: string;
}

export interface WorkKeyField {
  key: number;
}

export interface WorkSearchableFields {
  title: string;
  userName: string;
  tags: string[] | null;
  description: string | null;
}
