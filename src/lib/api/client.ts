import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { supabase } from "@/lib/supabase/client";

export const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
});

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/*
 * Public content the website caches (src/lib/query). A successful write to
 * any of these — the admin saving a course, a post, a gallery — clears that
 * cache, so the change shows on the next page view rather than after it
 * expires. Loaded lazily: this client also runs on the server, where there is
 * no cache to clear.
 */
const PUBLIC_CONTENT_PATH = /^\/?(courses|blogs|blog-authors|galleries)(\/|$|\?)/;

const clearPublicCacheAfterWrite = (config: InternalAxiosRequestConfig) => {
    const method = (config.method ?? "get").toLowerCase();

    if (
        typeof window === "undefined" ||
        method === "get" ||
        !PUBLIC_CONTENT_PATH.test(config.url ?? "")
    ) {
        return;
    }

    void import("@/lib/query/persister")
        .then(({ clearPublicContentCache }) => clearPublicContentCache())
        .catch(() => {});
};

api.interceptors.response.use(
    (response) => {
        clearPublicCacheAfterWrite(response.config);
        return response;
    },

    async (error: AxiosError) => {
        const originalRequest = error.config as
            | (InternalAxiosRequestConfig & { _retry?: boolean })
            | undefined;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const { data, error: refreshError } =
                await supabase.auth.refreshSession();

            if (!refreshError && data.session) {
                originalRequest.headers.Authorization =
                    `Bearer ${data.session.access_token}`;

                return api(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);