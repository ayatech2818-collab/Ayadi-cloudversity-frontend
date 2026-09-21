import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { supabase } from "@/lib/supabase/client";

export const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
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

api.interceptors.response.use(
    (response) => response,

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