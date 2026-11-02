import axios from "axios";

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

    /** The course an enrollment is for, when one was picked. */
    course_id?: string | null;
    course_title?: string | null;

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

    course_id?: string | null;
    course_title?: string | null;
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

export interface EnquiryExport {
    blob: Blob;
    filename: string;
}

/**
 * The name the backend gives the file. Only used when the browser cannot read
 * `Content-Disposition` — a cross-origin response hides it unless the API's
 * CORS setup lists it in `expose_headers`.
 */
const getExportFallbackName = (status?: EnquiryStatus): string => {
    const label = status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "All";

    const now = new Date();
    const date = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
    ].join("-");

    return `Ayadi_${label}_Enquiries_${date}.xlsx`;
};

/** `filename*=UTF-8''…` wins over a plain `filename="…"`. */
const readDispositionFilename = (
    header: unknown
): string | null => {
    if (typeof header !== "string") return null;

    const encoded = /filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i.exec(header);

    if (encoded) {
        try {
            return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ""));
        } catch {
            // Fall through to the plain form.
        }
    }

    const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);

    return plain ? plain[1].trim() : null;
};

/**
 * Export enquiries as an Excel workbook.
 *
 * Leave `status` out for every enquiry. Used by admin dashboard.
 */
export const exportEnquiries = async (
    status?: EnquiryStatus
): Promise<EnquiryExport> => {
    try {
        const response = await api.get<Blob>("/enquiries/export", {
            params: status ? { status } : undefined,
            responseType: "blob",
        });

        return {
            blob: response.data,
            filename:
                readDispositionFilename(
                    response.headers["content-disposition"]
                ) ?? getExportFallbackName(status),
        };
    } catch (error) {
        // An error body arrives as a Blob too. Turn it back into JSON so
        // getApiErrorMessage can read the backend's message.
        if (
            axios.isAxiosError(error) &&
            error.response?.data instanceof Blob
        ) {
            try {
                error.response.data = JSON.parse(
                    await error.response.data.text()
                );
            } catch {
                error.response.data = undefined;
            }
        }

        throw error;
    }
};
