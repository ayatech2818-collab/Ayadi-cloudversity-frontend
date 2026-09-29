import { api } from "./client";

export interface CourseSubcategory {
    id: string;
    category_id: string;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface CourseSubcategoryFormData {
    category_id: string;
    name: string;
    slug: string;
    description?: string | null;
    is_active: boolean;
    display_order: number;
}

export const getSubcategories = async (
    categoryId?: string
): Promise<CourseSubcategory[]> => {
    const response = await api.get<CourseSubcategory[]>(
        "/courses/subcategories",
        {
            params: categoryId
                ? { category_id: categoryId }
                : undefined,
        }
    );

    return response.data;
};

export const getSubcategory = async (
    id: string
): Promise<CourseSubcategory> => {
    const response = await api.get<CourseSubcategory>(
        `/courses/subcategories/${id}`
    );

    return response.data;
};

export const createSubcategory = async (
    data: CourseSubcategoryFormData
): Promise<CourseSubcategory> => {
    const response = await api.post<CourseSubcategory>(
        "/courses/subcategories",
        data
    );

    return response.data;
};

export const updateSubcategory = async (
    id: string,
    data: CourseSubcategoryFormData
): Promise<CourseSubcategory> => {
    const response = await api.put<CourseSubcategory>(
        `/courses/subcategories/${id}`,
        data
    );

    return response.data;
};

export const deleteSubcategory = async (
    id: string
): Promise<void> => {
    await api.delete(`/courses/subcategories/${id}`);
};