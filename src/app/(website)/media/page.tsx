import type { Metadata } from 'next';

import MediaGallery from './MediaGallery';

export const metadata: Metadata = {
  title: 'Media',
  description:
    'Photos and films from Ayadi Cloudversity — the people, events and stories behind the learning community.',
};

export default function MediaPage() {
  return <MediaGallery />;
}
