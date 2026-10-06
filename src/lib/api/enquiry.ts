import { api } from "./client";

export type EnquiryType = "contact" | "enrollment";

export type EnquiryStatus =
    | "new"
    | "contacted"
    | "converted"
    | "closed";

export interface Enquiry {
    id: string;

    type: EnquiryType;

    first_name: string;
    last_name: string | null;

    date_of_birth: string | null;

    email: string;
    phone: string | null;

    address: string | null;
    city: string | null;
    country: string | null;
    zipcode: string | null;

    message: string | null;

    status: EnquiryStatus;

    created_at: string;
    updated_at: string;
}

export interface EnquiryCreateData {
    type: EnquiryType;

    first_name: string;
    last_name?: string | null;

    date_of_birth?: string | null;

    email: string;
    phone?: string | null;

    address?: string | null;
    city?: string | null;
    country?: string | null;
    zipcode?: string | null;

    message?: string | null;
}

export interface EnquiryUpdateData {
    type?: EnquiryType;

    first_name?: string;
    last_name?: string | null;

    date_of_birth?: string | null;

    email?: string;
    phone?: string | null;

    address?: string | null;
    city?: string | null;
    country?: string | null;
    zipcode?: string | null;

    message?: string | null;

    status?: EnquiryStatus;
}

export interface EnquiryFilters {
    search?: string;
    type?: EnquiryType;
    status?: EnquiryStatus;
    sort_by?:
    | "newest"
    | "oldest"
    | "name-asc"
    | "name-desc";
}

/**
 * Get enquiries for admin dashboard.
 *
 * All filters are sent to the backend.
 * No frontend-side filtering is performed.
 */
export const getEnquiries = async (
    filters?: EnquiryFilters
): Promise<Enquiry[]> => {
    const response = await api.get<Enquiry[]>("/enquiries", {
        params: filters,
    });

    return response.data;
};


/**
 * Get a single enquiry.
 */
export const getEnquiry = async (
    id: string
): Promise<Enquiry> => {
    const response = await api.get<Enquiry>(
        `/enquiries/${id}`
    );

    return response.data;
};


/**
 * Create enquiry.
 *
 * This endpoint is public and is also used by
 * the public Ayadi website Contact / Enrollment forms.
 */
export const createEnquiry = async (
    data: EnquiryCreateData
): Promise<Enquiry> => {
    const response = await api.post<Enquiry>(
        "/enquiries",
        data
    );

    return response.data;
};


/**
 * Update enquiry.
 *
 * Used by admin dashboard.
 */
export const updateEnquiry = async (
    id: string,
    data: EnquiryUpdateData
): Promise<Enquiry> => {
    const response = await api.patch<Enquiry>(
        `/enquiries/${id}`,
        data
    );

    return response.data;
};


/**
 * Delete enquiry.
 *
 * Used by admin dashboard.
 */
export const deleteEnquiry = async (
    id: string
): Promise<void> => {
    await api.delete(`/enquiries/${id}`);
};