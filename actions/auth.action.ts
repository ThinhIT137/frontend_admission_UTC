"use server";

import { LoginPayload } from "@/libs/auth";
import { adminService } from "@/services/user.service";

/*=====================================================================
    login
=====================================================================*/
export const login = async ({ email, password }: LoginPayload) => {
    await adminService.login({ email, password });
};

/*=====================================================================
    logout
=====================================================================*/
export const logout = async () => {
    await adminService.logOut();
};

/*=====================================================================
    refresh access token
=====================================================================*/
export const refresh = async () => {
    await adminService.refreshAccessToken();
};
