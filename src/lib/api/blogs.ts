import { api } from "./client";

export type BlogStatus = "draft" | "published";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  cover_image_key?: string | null;
  cover_image_alt?: string | null;
  category: string | null;
  tags?: string[] | null;
  author_id?: string | null;
  author?: string | null;
  created_by?: string | null;
  status: BlogStatus;
  is_featured: boolean;
  published_at?: string | null;
  reading_time_minutes?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  created_at: string;
  updated_at: string;

  // UI helpers
  date?: string;
  readTime?: string;
  image?: string;
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;

  cover_image?: File | null;
  cover_image_alt?: string | null;

  category?: string | null;
  tags: string[];
  author_id?: string | null;

  status: BlogStatus;
  is_featured: boolean;
  published_at?: string | null;
  reading_time_minutes?: number;

  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords: string[];
}

export interface BlogFilters {
  search?: string;
  status?: "draft" | "published";
  category?: string;
  sort_by?:
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc";
}

const buildBlogFormData = (data: BlogFormData): FormData => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("slug", data.slug);
  formData.append("excerpt", data.excerpt);
  formData.append("content", data.content);

  if (data.cover_image) {
    formData.append("cover_image", data.cover_image);
  }

  if (data.cover_image_alt) {
    formData.append("cover_image_alt", data.cover_image_alt);
  }

  if (data.category) {
    formData.append("category", data.category);
  }

  if (data.tags.length > 0) {
    formData.append("tags", data.tags.join(","));
  }

  if (data.author_id) {
    formData.append("author_id", data.author_id);
  }

  formData.append("status", data.status);
  formData.append("is_featured", String(data.is_featured));

  if (data.published_at) {
    formData.append("published_at", data.published_at);
  }

  if (data.reading_time_minutes !== undefined) {
    formData.append(
      "reading_time_minutes",
      String(data.reading_time_minutes)
    );
  }

  if (data.seo_title) {
    formData.append("seo_title", data.seo_title);
  }

  if (data.seo_description) {
    formData.append("seo_description", data.seo_description);
  }

  if (data.seo_keywords.length > 0) {
    formData.append(
      "seo_keywords",
      data.seo_keywords.join(",")
    );
  }

  return formData;
};

export const getBlogs = async (
  filters?: BlogFilters
): Promise<Blog[]> => {
  const response = await api.get<Blog[]>("/blogs", {
    params: filters,
  });

  return response.data;
};

export const getBlog = async (id: string): Promise<Blog> => {
  const response = await api.get<Blog>(`/blogs/${id}`);
  return response.data;
};

export const createBlog = async (
  data: BlogFormData
): Promise<Blog> => {
  const formData = buildBlogFormData(data);

  const response = await api.post<Blog>("/blogs", formData);

  return response.data;
};

export const updateBlog = async (
  id: string,
  data: BlogFormData
): Promise<Blog> => {
  const formData = buildBlogFormData(data);

  const response = await api.patch<Blog>(
    `/blogs/${id}`,
    formData
  );

  return response.data;
};

export const deleteBlog = async (
  id: string
): Promise<void> => {
  await api.delete(`/blogs/${id}`);
};