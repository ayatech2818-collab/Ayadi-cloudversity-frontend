import { api } from "./client";

export interface Author {
    id: string;
    name: string;
    designation: string | null;
    bio: string | null;
    profile_image: string | null;
    linkedin_url: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export const getAuthors = async (): Promise<Author[]> => {
    const response = await api.get<Author[]>("/blog-authors");

    return response.data;
};

export const getAuthor = async (
    authorId: string
): Promise<Author> => {
    const response = await api.get<Author>(
        `/blog-authors/${authorId}`
    );

    return response.data;
};

export const createAuthor = async (
    data: FormData
): Promise<Author> => {
    const response = await api.post<Author>(
        "/blog-authors",
        data
    );

    return response.data;
};

export const updateAuthor = async (
    authorId: string,
    data: FormData
): Promise<Author> => {
    const response = await api.patch<Author>(
        `/blog-authors/${authorId}`,
        data
    );

    return response.data;
};

export const deleteAuthor = async (
    authorId: string
): Promise<void> => {
    await api.delete(`/blog-authors/${authorId}`);
};

export const restoreAuthor = async (
    authorId: string
): Promise<Author> => {
    const response = await api.patch<Author>(
        `/blog-authors/${authorId}/restore`
    );

    return response.data;
};

export const getDeletedAuthors = async (): Promise<Author[]> => {
    const response = await api.get<Author[]>(
        "/blog-authors/deleted"
    );

    return response.data;
};