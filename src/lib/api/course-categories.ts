import { api } from "./client";

export interface CourseCategory {
    id: string;
    brand_id: string;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface CourseCategoryFormData {
    brand_id: string;
    name: string;
    slug: string;
    description?: string | null;
    is_active: boolean;
    display_order: number;
}

/**
 * Get categories
 *
 * If brandId is provided, only categories
 * belonging to that brand are returned.
 */
export const getCategories = async (
    brandId?: string
): Promise<CourseCategory[]> => {
    const response = await api.get<CourseCategory[]>(
        "/courses/categories",
        {
            params: brandId
                ? { brand_id: brandId }
                : undefined,
        }
    );

    return response.data;
};

/**
 * Get single category
 */
export const getCategory = async (
    id: string
): Promise<CourseCategory> => {
    const response = await api.get<CourseCategory>(
        `/courses/categories/${id}`
    );

    return response.data;
};

/**
 * Create category
 */
export const createCategory = async (
    data: CourseCategoryFormData
): Promise<CourseCategory> => {
    const response = await api.post<CourseCategory>(
        "/courses/categories",
        data
    );

    return response.data;
};

/**
 * Update category
 */
export const updateCategory = async (
    id: string,
    data: CourseCategoryFormData
): Promise<CourseCategory> => {
    const response = await api.put<CourseCategory>(
        `/courses/categories/${id}`,
        data
    );

    return response.data;
};

/**
 * Delete category
 */
export const deleteCategory = async (
    id: string
): Promise<void> => {
    await api.delete(`/courses/categories/${id}`);
};