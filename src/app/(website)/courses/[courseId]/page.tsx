import axios from 'axios';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CourseDetailContent } from '@/components/website/courses/CourseDetailContent';
import {
  mapCourseToCatalogueCourse,
  type CatalogueCategory,
  type CatalogueCourse,
  type CatalogueSubcategory,
} from '@/components/website/courses/types';
import { getCategory } from '@/lib/api/course-categories';
import { getSubcategory } from '@/lib/api/course-subcategories';
import { getCourse, getCourses, type Course } from '@/lib/api/courses';

interface CourseDetailPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export const dynamicParams = true;

/** Pre-renders static parameters for known Ayadi Cloudversity courses. */
export async function generateStaticParams() {
  try {
    const courses = await getCourses({ is_published: true });
    return courses.map((course) => ({
      courseId: course.id,
    }));
  } catch (error) {
    // If backend is unreachable during build or empty, return [] so dynamic rendering takes over
    console.warn('Failed to pre-fetch courses for generateStaticParams:', error);
    return [];
  }
}

/** Dynamic SEO metadata tailored to the specific course from the FastAPI backend. */
export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { courseId } = await params;

  try {
    const course = await getCourse(courseId);

    if (!course || !course.is_published) {
      return {
        title: 'Course Not Found | Ayadi Cloudversity',
        description: 'The requested course could not be found.',
      };
    }

    let categoryName: string | undefined;
    if (course.category_id) {
      try {
        const cat = await getCategory(course.category_id);
        categoryName = cat?.name;
      } catch {
        // category lookup is non-fatal for metadata
      }
    }

    const title = categoryName
      ? `${course.title} — ${categoryName} | Ayadi Cloudversity`
      : `${course.title} | Ayadi Cloudversity Courses`;
    const description = course.short_description || course.description || '';
    const image = course.thumbnail_url || undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: image ? [{ url: image, alt: course.title }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 422)) {
      return {
        title: 'Course Not Found | Ayadi Cloudversity',
        description: 'The requested course could not be found.',
      };
    }
    return {
      title: 'Course | Ayadi Cloudversity',
      description: 'Explore courses at Ayadi Cloudversity.',
    };
  }
}

/** Dynamic route page for individual courses (/courses/[courseId]). */
export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;

  let courseData: Course | null = null;
  let isGenuineNotFound = false;

  try {
    const fetched = await getCourse(courseId);
    if (!fetched || !fetched.is_published) {
      isGenuineNotFound = true;
    } else {
      courseData = fetched;
    }
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 422)) {
      isGenuineNotFound = true;
    } else {
      console.error(`Failed to load course (${courseId}):`, error);
      throw error;
    }
  }

  if (isGenuineNotFound || !courseData) {
    notFound();
  }

  // Fetch category, subcategory, and related courses concurrently
  const [categoryResult, subcategoryResult, relatedCoursesResult] = await Promise.allSettled([
    courseData.category_id ? getCategory(courseData.category_id) : Promise.resolve(null),
    courseData.subcategory_id ? getSubcategory(courseData.subcategory_id) : Promise.resolve(null),
    courseData.category_id
      ? getCourses({ category_id: courseData.category_id, is_published: true })
      : Promise.resolve([]),
  ]);

  const category: CatalogueCategory | undefined =
    categoryResult.status === 'fulfilled' && categoryResult.value
      ? {
          id: categoryResult.value.id,
          slug: categoryResult.value.slug,
          name: categoryResult.value.name,
          description: categoryResult.value.description,
          display_order: categoryResult.value.display_order,
        }
      : undefined;

  const subcategory: CatalogueSubcategory | undefined =
    subcategoryResult.status === 'fulfilled' && subcategoryResult.value
      ? {
          id: subcategoryResult.value.id,
          category_id: subcategoryResult.value.category_id,
          slug: subcategoryResult.value.slug,
          name: subcategoryResult.value.name,
          description: subcategoryResult.value.description,
          display_order: subcategoryResult.value.display_order,
        }
      : undefined;

  const relatedCourses: CatalogueCourse[] =
    relatedCoursesResult.status === 'fulfilled' && Array.isArray(relatedCoursesResult.value)
      ? relatedCoursesResult.value
          .filter((item) => item.id !== courseData.id)
          .slice(0, 3)
          .map(mapCourseToCatalogueCourse)
      : [];

  const catalogueCourse: CatalogueCourse = {
    ...mapCourseToCatalogueCourse(courseData),
    description: courseData.description?.trim() || courseData.short_description?.trim() || '',
  };

  return (
    <CourseDetailContent
      course={catalogueCourse}
      category={category}
      subcategory={subcategory}
      relatedCourses={relatedCourses}
    />
  );
}
