import { api } from "./client";

import type {
    Enquiry,
    EnquiryCreateData,
} from "../api/enquiry"

/**
 * Data required to create an enrollment.
 *
 * The backend uses the same Enquiry model for
 * both contact and enrollment submissions.
 *
 * `type: "enrollment"` is added automatically
 * by createEnrollment().
 */
export interface EnrollmentCreateData {
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

/**
 * Create an enrollment enquiry.
 *
 * Backend:
 * POST /enquiries
 *
 * The only difference from a contact enquiry
 * is that the type is always "enrollment".
 */
export const createEnrollment = async (
    data: EnrollmentCreateData
): Promise<Enquiry> => {
    const payload: EnquiryCreateData = {
        type: "enrollment",

        first_name: data.first_name,
        last_name: data.last_name ?? null,

        date_of_birth: data.date_of_birth || null,

        email: data.email,
        phone: data.phone ?? null,

        address: data.address ?? null,
        city: data.city ?? null,
        country: data.country ?? null,
        zipcode: data.zipcode ?? null,

        message: data.message ?? null,
    };

    const response = await api.post<Enquiry>(
        "/enquiries",
        payload
    );

    return response.data;
};