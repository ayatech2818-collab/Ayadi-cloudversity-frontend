import type {
  Blog,
  BlogFormData,
  BlogStatus,
} from "@/lib/api/blogs";

import {
  BLOG_CATEGORIES,
  estimateReadingTime,
} from "./blog-utils";

/** Everything the editor holds, apart from the picked cover file. */
export interface BlogFormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;

  category: string;
  authorId: string;
  tags: string[];
  isFeatured: boolean;

  coverImageAlt: string;

  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

export type BlogFormErrors = Partial<
  Record<"title" | "slug" | "excerpt" | "content" | "cover", string>
>;

/** The props every group of editor fields takes. */
export interface BlogFieldsProps {
  values: BlogFormValues;
  errors: BlogFormErrors;
  disabled: boolean;
  onChange: <Field extends keyof BlogFormValues>(
    field: Field,
    value: BlogFormValues[Field]
  ) => void;
}

const toList = (value?: string[] | null): string[] =>
  Array.isArray(value) ? value : [];

/** The form's starting point: the blog being edited, or a blank post. */
export const toFormValues = (blog?: Blog | null): BlogFormValues => ({
  title: blog?.title ?? "",
  slug: blog?.slug ?? "",
  excerpt: blog?.excerpt ?? "",
  content: blog?.content ?? "",

  category: blog?.category || BLOG_CATEGORIES[0],
  authorId: blog?.author_id ?? "",
  tags: toList(blog?.tags),
  isFeatured: Boolean(blog?.is_featured),

  coverImageAlt: blog?.cover_image_alt ?? "",

  seoTitle: blog?.seo_title ?? "",
  seoDescription: blog?.seo_description ?? "",
  seoKeywords: toList(blog?.seo_keywords),
});

export const validateBlogForm = (
  values: BlogFormValues
): BlogFormErrors => {
  const errors: BlogFormErrors = {};

  if (!values.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!values.slug.trim()) {
    errors.slug = "Slug is required.";
  } else if (!/^[a-z0-9-]+$/.test(values.slug)) {
    errors.slug =
      "Use only lowercase letters, numbers and hyphens.";
  }

  if (!values.excerpt.trim()) {
    errors.excerpt = "Excerpt is required.";
  }

  if (!values.content.trim()) {
    errors.content = "Content is required.";
  }

  return errors;
};

/** The body the API takes. `status` comes from the button that was pressed. */
export const toBlogPayload = (
  values: BlogFormValues,
  cover: File | null,
  status: BlogStatus
): BlogFormData => ({
  title: values.title.trim(),
  slug: values.slug.trim(),
  excerpt: values.excerpt.trim(),
  content: values.content.trim(),

  cover_image: cover,
  cover_image_alt: values.coverImageAlt.trim() || null,

  category: values.category.trim() || null,
  tags: values.tags,
  author_id: values.authorId || null,

  status,
  is_featured: values.isFeatured,
  reading_time_minutes: estimateReadingTime(values.content),

  seo_title: values.seoTitle.trim() || null,
  seo_description: values.seoDescription.trim() || null,
  seo_keywords: values.seoKeywords,
});
