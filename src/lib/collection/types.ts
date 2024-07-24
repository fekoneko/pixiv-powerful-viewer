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

  id?: number;
  userId?: number;
  url?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  ageRestriction?: AgeRestriction;
  ai?: boolean;
  description?: string;
  tags?: string[];
  dimensions?: ImageDimensions;
  bookmarks?: number;
  uploadTime?: string;
}

export interface WorkLike {
  relativePath: string;
}
