export type AgeRestriction = 'all-ages' | 'r-18' | 'r-18g';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageAsset {
  name: string;
  path: string;
  dimensions: ImageDimensions;
}

export interface Work {
  path: string;
  relativePath: string;
  title: string;
  userName: string;
  assets: ImageAsset[];

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

export interface WorkLike {
  relativePath: string;
}
