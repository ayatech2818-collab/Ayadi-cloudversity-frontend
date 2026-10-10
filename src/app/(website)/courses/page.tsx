import type { Metadata } from 'next';
import { courseCategories } from '@/components/website/courses/categories';
import { CoursesPageContent } from '@/components/website/courses/CoursesPageContent';

export const metadata: Metadata = {
  title: 'Courses & Programs',
  description: `Explore Ayadi Cloudversity courses by category: ${courseCategories
    .map((category) => category.name)
    .join(', ')}.`,
};

export default function CoursesPage() {
  return <CoursesPageContent />;
}
