import { api } from "./client";

export interface CourseMiniCategory {
    id: string;
    subcategory_id: string;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface CourseMiniCategoryFormData {
    subcategory_id: string;
    name: string;
    slug: string;
    description?: string | null;
    is_active: boolean;
    display_order: number;
}

export const getMiniCategories = async (
    subcategoryId?: string
): Promise<CourseMiniCategory[]> => {
    const response = await api.get<CourseMiniCategory[]>(
        "/courses/mini-categories",
        {
            params: subcategoryId
                ? { subcategory_id: subcategoryId }
                : undefined,
        }
    );

    return response.data;
};

export const getMiniCategory = async (
    id: string
): Promise<CourseMiniCategory> => {
    const response = await api.get<CourseMiniCategory>(
        `/courses/mini-categories/${id}`
    );

    return response.data;
};

export const createMiniCategory = async (
    data: CourseMiniCategoryFormData
): Promise<CourseMiniCategory> => {
    const response = await api.post<CourseMiniCategory>(
        "/courses/mini-categories",
        data
    );

    return response.data;
};

export const updateMiniCategory = async (
    id: string,
    data: CourseMiniCategoryFormData
): Promise<CourseMiniCategory> => {
    const response = await api.put<CourseMiniCategory>(
        `/courses/mini-categories/${id}`,
        data
    );

    return response.data;
};

export const deleteMiniCategory = async (
    id: string
): Promise<void> => {
    await api.delete(`/courses/mini-categories/${id}`);
};
