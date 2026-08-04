export interface GalleryItem {
  id: string;
  title: string;
  category: 'Highlights' | 'Performances' | 'Behind the Scenes' | 'Award Ceremony';
  imageUrl: string;
  caption: string;
  aspectRatio: string;
}

export const GALLERY_CATEGORIES = ['All', 'Highlights', 'Performances', 'Behind the Scenes', 'Award Ceremony'] as const;

export const GALLERY_DATA: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Graceful Bharatanatyam recital',
    category: 'Performances',
    imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1000&auto=format&fit=crop',
    caption: 'Student performer rendering traditional classical footwork at Stage 1.',
    aspectRatio: 'aspect-[3/4]',
  },
  {
    id: 'g-2',
    title: 'Vibrant Kerala Cultural Procession',
    category: 'Highlights',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1000&auto=format&fit=crop',
    caption: 'Grand inauguration parade showcasing Theyyam and Chenda Melam.',
    aspectRatio: 'aspect-[4/3]',
  },
  {
    id: 'g-3',
    title: 'Live Watercolor Masterpiece in Progress',
    category: 'Performances',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop',
    caption: 'Participant at the Art Pavilion blending radiant shades.',
    aspectRatio: 'aspect-[1/1]',
  },
  {
    id: 'g-4',
    title: 'Stage Spotlight & Choral Symphony',
    category: 'Performances',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
    caption: 'Group song participants performing under warm editorial stage lights.',
    aspectRatio: 'aspect-[16/9]',
  },
  {
    id: 'g-5',
    title: 'Backstage Makeup & Kathakali Preparation',
    category: 'Behind the Scenes',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000&auto=format&fit=crop',
    caption: 'Intricate face painting and traditional costume adjustments before stage entry.',
    aspectRatio: 'aspect-[3/4]',
  },
  {
    id: 'g-6',
    title: 'Overall Championship Trophy Reveal',
    category: 'Award Ceremony',
    imageUrl: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?q=80&w=1000&auto=format&fit=crop',
    caption: 'Gold plated Kalathmakam Rolling Trophy unveiled for 2K26.',
    aspectRatio: 'aspect-[4/3]',
  },
  {
    id: 'g-7',
    title: 'Dramatic Mime & Expression',
    category: 'Performances',
    imageUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=1000&auto=format&fit=crop',
    caption: 'Captivating silent dramatic act at Open Air Theatre.',
    aspectRatio: 'aspect-[3/4]',
  },
  {
    id: 'g-8',
    title: 'Student Jury & Volunteer Team',
    category: 'Behind the Scenes',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop',
    caption: 'Dedicated MGM student coordinators ensuring smooth stage management.',
    aspectRatio: 'aspect-[16/9]',
  },
];
