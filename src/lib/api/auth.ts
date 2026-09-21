import { api } from "./client";
import { supabase } from "../supabase/client";

export interface AdminProfile {
    id: string;
    full_name: string;
    role: string;
    is_active: boolean;
}

export const getCurrentAdmin = async (): Promise<AdminProfile> => {
    const response = await api.get<AdminProfile>("/auth/me");

    return response.data;
};

export const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
};
