export interface GalleryItem {
  id: string;
  title: string;
  category: 'Highlights' | 'Performances' | 'Behind the Scenes' | 'Award Ceremony';
  imageUrl: string;
  caption: string;
  aspectRatio: string;
}

export const GALLERY_CATEGORIES = ['All', 'Highlights', 'Performances', 'Behind the Scenes', 'Award Ceremony'] as const;

export const GALLERY_DATA: GalleryItem[] = [];

