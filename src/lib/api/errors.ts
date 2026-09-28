import axios from "axios";

interface ValidationDetail {
  msg?: unknown;
  loc?: unknown;
}

const readValidationDetail = (
  detail: unknown
): string | null => {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((entry: ValidationDetail) =>
        typeof entry?.msg === "string" ? entry.msg : null
      )
      .filter((message): message is string =>
        Boolean(message)
      );

    if (messages.length > 0) {
      return messages.join(" · ");
    }
  }

  return null;
};

/**
 * Unwraps the message the API actually sent. Axios otherwise surfaces
 * "Request failed with status code 422", which tells an admin nothing.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: unknown; message?: unknown }
      | undefined;

    const detail = readValidationDetail(data?.detail);

    if (detail) return detail;

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (!error.response) {
      return "Could not reach the server. Check your connection and try again.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
