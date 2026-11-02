import axios from 'axios';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { CourseDetailContent } from '@/components/website/courses/CourseDetailContent';
import {
  mapCourseToCatalogueCourse,
  mapCourseToCourseDetail,
  type CatalogueCategory,
  type CatalogueCourse,
  type CatalogueMiniCategory,
  type CatalogueSubcategory,
} from '@/components/website/courses/types';
import { getCategory } from '@/lib/api/course-categories';
import { getMiniCategory } from '@/lib/api/course-mini-categories';
import { getSubcategory } from '@/lib/api/course-subcategories';
import { getCourse, getCourses, type Course } from '@/lib/api/courses';

interface CourseDetailPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export const dynamicParams = true;

const RELATED_COURSE_COUNT = 3;

/* The metadata and the page both need these. Axios requests are not memoized
   the way fetch is, so without this each would be sent twice per render. */
const loadCourse = cache(getCourse);
const loadCategory = cache(getCategory);

/** Up to three other courses, closest in the hierarchy first: same mini-category,
    then same subcategory, then the rest of the category. The sort is stable, so
    the admin's display order holds within each group. */
function pickRelatedCourses(course: Course, candidates: Course[]): Course[] {
  const closeness = (candidate: Course) => {
    if (course.mini_category_id && candidate.mini_category_id === course.mini_category_id) return 2;
    if (course.subcategory_id && candidate.subcategory_id === course.subcategory_id) return 1;
    return 0;
  };

  return candidates
    .filter((candidate) => candidate.id !== course.id)
    .sort((a, b) => closeness(b) - closeness(a))
    .slice(0, RELATED_COURSE_COUNT);
}

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
    const course = await loadCourse(courseId);

    if (!course || !course.is_published) {
      return {
        title: { absolute: 'Course Not Found | Ayadi Cloudversity' },
        description: 'The requested course could not be found.',
      };
    }

    let categoryName: string | undefined;
    if (course.category_id) {
      try {
        const cat = await loadCategory(course.category_id);
        categoryName = cat?.name;
      } catch {
        // category lookup is non-fatal for metadata
      }
    }

    const title = categoryName
      ? `${course.title} — ${categoryName} | Ayadi Cloudversity`
      : `${course.title} | Ayadi Cloudversity Courses`;
    const description = course.short_description || course.description || undefined;
    const image = course.thumbnail_url || undefined;

    return {
      // Absolute: these already carry the brand, and the layout's template would add it again.
      title: { absolute: title },
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
        title: { absolute: 'Course Not Found | Ayadi Cloudversity' },
        description: 'The requested course could not be found.',
      };
    }
    return {
      title: { absolute: 'Course | Ayadi Cloudversity' },
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
    const fetched = await loadCourse(courseId);
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

  // Fetch category, subcategory, mini-category and related courses concurrently
  const [categoryResult, subcategoryResult, miniCategoryResult, relatedCoursesResult] = await Promise.allSettled([
    courseData.category_id ? loadCategory(courseData.category_id) : Promise.resolve(null),
    courseData.subcategory_id ? getSubcategory(courseData.subcategory_id) : Promise.resolve(null),
    courseData.mini_category_id ? getMiniCategory(courseData.mini_category_id) : Promise.resolve(null),
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

  const miniCategory: CatalogueMiniCategory | undefined =
    miniCategoryResult.status === 'fulfilled' && miniCategoryResult.value
      ? {
          id: miniCategoryResult.value.id,
          subcategory_id: miniCategoryResult.value.subcategory_id,
          slug: miniCategoryResult.value.slug,
          name: miniCategoryResult.value.name,
          description: miniCategoryResult.value.description,
          display_order: miniCategoryResult.value.display_order,
        }
      : undefined;

  const relatedCourses: CatalogueCourse[] =
    relatedCoursesResult.status === 'fulfilled' && Array.isArray(relatedCoursesResult.value)
      ? pickRelatedCourses(courseData, relatedCoursesResult.value).map(mapCourseToCatalogueCourse)
      : [];

  return (
    <CourseDetailContent
      course={mapCourseToCourseDetail(courseData)}
      category={category}
      subcategory={subcategory}
      miniCategory={miniCategory}
      relatedCourses={relatedCourses}
    />
  );
}
