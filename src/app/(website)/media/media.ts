/*
 * Media archive data. `image` paths are placeholders — nothing lives in
 * public/images/media/ yet, and MediaImage renders a designed fallback until
 * the backend supplies real URLs. Swapping `image` for a remote URL later needs
 * no other change (add the host to next.config.ts remotePatterns).
 */

export type MediaType = 'image' | 'video';

/* Drives the tile's shape in the mosaic. Set per item rather than measured, so
   the grid never reflows while images load — and so the layout is already
   correct before any image exists. */
export type MediaAspect = 'portrait' | 'landscape' | 'square';

export type MediaItem = {
  id: number;
  title: string;
  category: string;
  type: MediaType;
  /** ISO, for <time dateTime>. */
  date: string;
  displayDate: string;
  image: string;
  description: string;
  aspect: MediaAspect;
  featured?: boolean;
};

export const mediaItems: MediaItem[] = [
  {
    id: 1,
    title: 'Ayadi Learning Summit',
    category: 'Events',
    type: 'image',
    date: '2026-09-12',
    displayDate: '12 Sep 2026',
    image: '/images/media/media-1.jpg',
    description: 'A glimpse into our learning community coming together to exchange ideas and experiences.',
    aspect: 'landscape',
    featured: true,
  },
  {
    id: 2,
    title: 'Learning Beyond Classrooms',
    category: 'Workshops',
    type: 'video',
    date: '2026-09-08',
    displayDate: '08 Sep 2026',
    image: '/images/media/media-2.jpg',
    description: 'An interactive learning experience designed around collaboration and discovery.',
    aspect: 'portrait',
  },
  {
    id: 3,
    title: 'Community Moments',
    category: 'Community',
    type: 'image',
    date: '2026-09-02',
    displayDate: '02 Sep 2026',
    image: '/images/media/media-3.jpg',
    description: 'Small moments that make the Ayadi community special.',
    aspect: 'square',
  },
  {
    id: 4,
    title: 'Student Innovation Day',
    category: 'Students',
    type: 'image',
    date: '2026-08-28',
    displayDate: '28 Aug 2026',
    image: '/images/media/media-4.jpg',
    description: 'Students presenting ideas, projects and creative solutions.',
    aspect: 'portrait',
  },
  {
    id: 5,
    title: 'Inside Ayadi',
    category: 'Campus',
    type: 'video',
    date: '2026-08-20',
    displayDate: '20 Aug 2026',
    image: '/images/media/media-5.jpg',
    description: 'A cinematic look into the spaces and people behind the learning experience.',
    aspect: 'landscape',
    featured: true,
  },
  {
    id: 6,
    title: 'Workshop Highlights',
    category: 'Workshops',
    type: 'image',
    date: '2026-08-15',
    displayDate: '15 Aug 2026',
    image: '/images/media/media-6.jpg',
    description: 'Highlights from one of our hands-on learning sessions.',
    aspect: 'square',
  },
  {
    id: 7,
    title: 'Celebrating Achievement',
    category: 'Achievements',
    type: 'image',
    date: '2026-08-09',
    displayDate: '09 Aug 2026',
    image: '/images/media/media-7.jpg',
    description: 'Celebrating the achievements of our learners and community.',
    aspect: 'portrait',
  },
  {
    id: 8,
    title: 'The Ayadi Experience',
    category: 'Community',
    type: 'video',
    date: '2026-08-01',
    displayDate: '01 Aug 2026',
    image: '/images/media/media-8.jpg',
    description: 'Stories, experiences and moments from the Ayadi journey.',
    aspect: 'landscape',
    featured: true,
  },
];

export const categories = ['All', ...Array.from(new Set(mediaItems.map((item) => item.category)))];

/** The pinned filmstrip runs on these. */
export const reelItems = mediaItems.slice(0, 6);
