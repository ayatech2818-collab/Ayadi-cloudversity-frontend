import type { Metadata } from 'next';

import BlogList from './BlogList';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights, ideas, and perspectives from Ayadi Cloudversity on education, technology, careers, and lifelong learning.',
};

export default function BlogPage() {
  return <BlogList />;
}
