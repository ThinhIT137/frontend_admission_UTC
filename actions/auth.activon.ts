"use server";

import { LoginPayload } from "@/libs/user";
import { adminService } from "@/services/user.service";

export const authAction = {
    /*=====================================================================
    login
    =====================================================================*/
    login: async ({ email, password }: LoginPayload) => {
        await adminService.login({ email, password });
    },
    /*=====================================================================
    logout
    =====================================================================*/
    logout: async () => {
        await adminService.logOut();
    },
    /*=====================================================================
    refresh access token
    =====================================================================*/
    refresh: async () => {
        await adminService.refreshAccessToken();
    },
};
