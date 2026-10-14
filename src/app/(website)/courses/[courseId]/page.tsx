import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { categoryById } from '@/components/website/courses/categories';
import { CourseDetailContent } from '@/components/website/courses/CourseDetailContent';
import { ayadiCourses, courseById } from '@/components/website/courses/dummyData';
import { subcategoryById } from '@/components/website/courses/subcategories';

interface CourseDetailPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

/** Pre-renders static parameters for all known Ayadi Cloudversity courses. */
export async function generateStaticParams() {
  return ayadiCourses.map((course) => ({
    courseId: course.id,
  }));
}

/** Dynamic SEO metadata tailored to the specific course. */
export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = courseById(courseId);

  if (!course) {
    return {
      title: 'Course Not Found | Ayadi Cloudversity',
      description: 'The requested course could not be found.',
    };
  }

  const category = categoryById(course.categoryId);
  const title = category
    ? `${course.title} — ${category.name} | Ayadi Cloudversity`
    : `${course.title} | Ayadi Cloudversity Courses`;
  const description = course.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: course.image
        ? [
            {
              url: course.image,
              alt: course.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: course.image ? [course.image] : undefined,
    },
  };
}

/** Dynamic route page for individual courses (/courses/[courseId]). */
export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;
  const course = courseById(courseId);

  if (!course) {
    notFound();
  }

  const category = categoryById(course.categoryId);
  const subcategory = course.subcategoryId ? subcategoryById(course.subcategoryId) : undefined;

  // Gather other courses in the same category for the related courses section
  const relatedCourses = ayadiCourses
    .filter((item) => item.categoryId === course.categoryId && item.id !== course.id)
    .slice(0, 3);

  return (
    <CourseDetailContent
      course={course}
      category={category}
      subcategory={subcategory}
      relatedCourses={relatedCourses}
    />
  );
}
