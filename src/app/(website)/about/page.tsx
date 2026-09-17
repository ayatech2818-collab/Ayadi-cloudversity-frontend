import type { Metadata } from 'next';

import AboutContent from './AboutContent';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Ayadi Cloudversity is a community of educators building pathways from preschool through higher education, workplace readiness, and lifelong learning.',
};

export default function AboutPage() {
  return <AboutContent />;
}
