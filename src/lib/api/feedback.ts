import { api } from "./client";

export interface Feedback {
  id: string;
  name: string;
  rating: number;
  message: string;
  is_approved: boolean;
  created_at: string;
}

export interface FeedbackFilters {
  is_approved?: boolean;
}

const FEEDBACK_PAGE_SIZE = 100;

/** Fetches every admin feedback page for the selected approval state. */
export const getAdminFeedback = async (
  filters?: FeedbackFilters
): Promise<Feedback[]> => {
  const feedback: Feedback[] = [];
  let skip = 0;

  while (true) {
    const response = await api.get<Feedback[]>("/feedback/admin", {
      params: {
        ...filters,
        skip,
        limit: FEEDBACK_PAGE_SIZE,
      },
    });

    feedback.push(...response.data);

    if (response.data.length < FEEDBACK_PAGE_SIZE) {
      return feedback;
    }

    skip += response.data.length;
  }
};

export const updateFeedbackApproval = async (
  feedbackId: string,
  isApproved: boolean
): Promise<Feedback> => {
  const response = await api.patch<Feedback>(
    `/feedback/admin/${feedbackId}/approval`,
    { is_approved: isApproved }
  );

  return response.data;
};

/** Fetches the most recent feedback entries for dashboard overview. */
export const getRecentAdminFeedback = async (
  limit = 5
): Promise<Feedback[]> => {
  const response = await api.get<Feedback[]>("/feedback/admin", {
    params: {
      skip: 0,
      limit,
    },
  });

  return response.data;
};

export interface FeedbackCreateData {
  name: string;
  rating: number;
  message: string;
}

/**
 * Public: Get approved feedback entries.
 * The backend enforces is_approved=True on GET /feedback.
 */
export const getPublicFeedback = async (
  params?: { skip?: number; limit?: number }
): Promise<Feedback[]> => {
  const response = await api.get<Feedback[]>("/feedback", {
    params: {
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 100,
    },
  });

  return response.data;
};

/**
 * Public: Submit new feedback for administrator review.
 * Submissions are initialized as is_approved=False by the backend.
 */
export const createFeedback = async (
  data: FeedbackCreateData
): Promise<Feedback> => {
  const response = await api.post<Feedback>("/feedback", data);
  return response.data;
};
