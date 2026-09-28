import { khoiNganhService } from "@/services/khoi_nganh.service";
import { khoiNganhProp } from "./khoiNganhProps";

export const khoiNganh = {
    get: async (): Promise<khoiNganhProp[]> => {
        return await khoiNganhService.getAll();
    },
};
