import prisma from "@/libs/prisma";
import { Prisma } from "@/app/generated/prisma/browser";
import { adminService } from "./user.service";

export interface CreateRoleRequest {
    ten_vai_tro: string;
    mo_ta?: string;
}

export interface UpdateRoleRequest {
    ten_vai_tro?: string;
    mo_ta?: string;
}

export const roleService = {
    get: async (search?: string, page: number = 1, limit: number = 10) => {
        const where: any = {};
        
        if (search) {
            where.OR = [
                { ten_vai_tro: { contains: search, mode: "insensitive" } },
                { mo_ta: { contains: search, mode: "insensitive" } },
            ];
        }

        const total = await prisma.vaiTro.count({ where });
        const skip = (page - 1) * limit;

        const data = await prisma.vaiTro.findMany({
            where,
            skip,
            take: limit,
        });

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    },

    create: async (data: CreateRoleRequest, ma_admin_thuc_hien: string) => {
        if (!(await adminService.isSuperAdmin(ma_admin_thuc_hien))) {
            throw new Error("Chỉ Super Admin mới có quyền tạo vai trò");
        }

        const existing = await prisma.vaiTro.findUnique({
            where: { ten_vai_tro: data.ten_vai_tro },
        });
        if (existing) throw new Error("Tên vai trò đã tồn tại");

        await prisma.vaiTro.create({
            data: {
                ten_vai_tro: data.ten_vai_tro,
                mo_ta: data.mo_ta,
            },
        });
    },

    update: async (ma_vai_tro: string, data: UpdateRoleRequest, ma_admin_thuc_hien: string) => {
        if (!(await adminService.isSuperAdmin(ma_admin_thuc_hien))) {
            throw new Error("Chỉ Super Admin mới có quyền sửa vai trò");
        }

        const existing = await prisma.vaiTro.findUnique({ where: { ma_vai_tro } });
        if (!existing) throw new Error("Vai trò không tồn tại");

        if (data.ten_vai_tro && data.ten_vai_tro !== existing.ten_vai_tro) {
            const duplicate = await prisma.vaiTro.findUnique({ where: { ten_vai_tro: data.ten_vai_tro } });
            if (duplicate) throw new Error("Tên vai trò đã tồn tại");
        }

        await prisma.vaiTro.update({
            where: { ma_vai_tro },
            data,
        });
    },

    delete: async (ma_vai_tro: string, ma_admin_thuc_hien: string) => {
        if (!(await adminService.isSuperAdmin(ma_admin_thuc_hien))) {
            throw new Error("Chỉ Super Admin mới có quyền xóa vai trò");
        }
        
        const role = await prisma.vaiTro.findUnique({ 
            where: { ma_vai_tro },
            include: { _count: { select: { admins: true } } }
        });
        
        if (!role) throw new Error("Vai trò không tồn tại");
        
        if (role.ten_vai_tro === "super_admin" || role.ten_vai_tro === "chuyen_vien") {
            throw new Error("Không thể xóa vai trò mặc định của hệ thống");
        }
        
        if (role._count.admins > 0) {
            throw new Error("Không thể xóa vai trò đang có người sử dụng");
        }

        await prisma.vaiTro.delete({
            where: { ma_vai_tro },
        });
    },
};
