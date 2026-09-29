import { api } from "./client";

export interface Course {
    id: string;

    brand_id: string;
    category_id: string | null;
    subcategory_id: string | null;

    name: string;
    slug: string;
    course_code: string;

    short_description: string | null;
    description: string | null;

    thumbnail_url: string | null;

    duration: string | null;
    level: string | null;

    price: number | null;

    is_active: boolean;
    display_order: number;

    created_at: string;
    updated_at: string;
}

export interface CourseFormData {
    brand_id: string;
    category_id?: string | null;
    subcategory_id?: string | null;

    name: string;
    slug: string;
    course_code: string;

    short_description?: string | null;
    description?: string | null;

    duration?: string | null;
    level?: string | null;

    price?: number | null;

    is_active: boolean;
    display_order: number;

    thumbnail?: File | null;
}

export interface CourseFilters {
    brand_id?: string;
    category_id?: string;
    subcategory_id?: string;
    is_active?: boolean;
    search?: string;
}

const buildCourseFormData = (
    data: CourseFormData
): FormData => {
    const formData = new FormData();

    formData.append("brand_id", data.brand_id);

    if (data.category_id) {
        formData.append("category_id", data.category_id);
    }

    if (data.subcategory_id) {
        formData.append(
            "subcategory_id",
            data.subcategory_id
        );
    }

    formData.append("name", data.name);
    formData.append("slug", data.slug);
    formData.append("course_code", data.course_code);

    if (data.short_description) {
        formData.append(
            "short_description",
            data.short_description
        );
    }

    if (data.description) {
        formData.append(
            "description",
            data.description
        );
    }

    if (data.duration) {
        formData.append("duration", data.duration);
    }

    if (data.level) {
        formData.append("level", data.level);
    }

    if (data.price !== null && data.price !== undefined) {
        formData.append("price", String(data.price));
    }

    formData.append(
        "is_active",
        String(data.is_active)
    );

    formData.append(
        "display_order",
        String(data.display_order)
    );

    if (data.thumbnail) {
        formData.append("thumbnail", data.thumbnail);
    }

    return formData;
};

export const getCourses = async (
    filters?: CourseFilters
): Promise<Course[]> => {
    const response = await api.get<Course[]>(
        "/courses",
        {
            params: filters,
        }
    );

    return response.data;
};

export const getCourse = async (
    id: string
): Promise<Course> => {
    const response = await api.get<Course>(
        `/courses/${id}`
    );

    return response.data;
};

export const createCourse = async (
    data: CourseFormData
): Promise<Course> => {
    const formData = buildCourseFormData(data);

    const response = await api.post<Course>(
        "/courses",
        formData
    );

    return response.data;
};

export const updateCourse = async (
    id: string,
    data: CourseFormData
): Promise<Course> => {
    const formData = buildCourseFormData(data);

    const response = await api.patch<Course>(
        `/courses/${id}`,
        formData
    );

    return response.data;
};

export const deleteCourse = async (
    id: string
): Promise<void> => {
    await api.delete(`/courses/${id}`);
};