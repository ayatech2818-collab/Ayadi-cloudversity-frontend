import type { Metadata } from 'next';
import { CoursesPageContent } from '@/components/website/courses/CoursesPageContent';

export const metadata: Metadata = {
  title: 'Courses & Programs',
  description:
    'Explore courses and learning programs from Ayadi Cloudversity, AyaTech, and Netscape.',
};

export default function CoursesPage() {
  return <CoursesPageContent />;
}
