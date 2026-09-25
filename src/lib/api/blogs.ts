import { api } from "./client";

export type BlogStatus = "draft" | "published";

export interface Blog {
  id: string | number;
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
  created_at?: string;
  updated_at?: string;
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
  cover_image: string | null;
  cover_image_key?: string | null;
  cover_image_alt?: string | null;
  category: string | null;
  tags: string[];
  author_id?: string | null;
  author?: string | null;
  status: BlogStatus;
  is_featured: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords: string[];
}

export const getBlogs = async (): Promise<Blog[]> => {
  const response = await api.get<Blog[]>("/blogs");
  return response.data;
};

export const getBlog = async (id: string | number): Promise<Blog> => {
  const response = await api.get<Blog>(`/blogs/${id}`);
  return response.data;
};

export const createBlog = async (data: BlogFormData): Promise<Blog> => {
  const response = await api.post<Blog>("/blogs", data);
  return response.data;
};

export const updateBlog = async (
  id: string | number,
  data: BlogFormData
): Promise<Blog> => {
  const response = await api.put<Blog>(`/blogs/${id}`, data);
  return response.data;
};

export const deleteBlog = async (id: string | number): Promise<void> => {
  await api.delete(`/blogs/${id}`);
};
