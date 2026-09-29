import { api } from "./client";

export interface CourseBrand {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    display_order: number;
}

export const getCourseBrands = async (): Promise<CourseBrand[]> => {
    const response = await api.get<CourseBrand[]>("/courses/brands");
    return response.data;
};