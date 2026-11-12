"use client";

import React, { createContext, useContext, useMemo } from "react";

export interface AdminPermissionContextType {
  role: string;
  permissions: string[];
  isSuperAdmin: boolean;
  hasPermission: (perm: string) => boolean;
  canManage: (perm: string) => boolean;
}

const AdminPermissionContext = createContext<AdminPermissionContextType>({
  role: "",
  permissions: [],
  isSuperAdmin: false,
  hasPermission: () => true,
  canManage: () => true,
});

export function parsePermissions(roleName?: string, moTa?: string | null): string[] {
  if (roleName === "super_admin") {
    return [
      "FACULTY_MANAGE",
      "MAJOR_MANAGE",
      "COMBINATION_MANAGE",
      "METHOD_MANAGE",
      "QUOTA_MANAGE",
      "TIMELINE_MANAGE",
      "ARTICLE_MANAGE",
      "AI_CHAT_MANAGE",
      "USER_MANAGE",
      "ROLE_MANAGE",
    ];
  }

  const raw = moTa || "";
  if (raw.startsWith("PERMS:")) {
    const parts = raw.split(" | ");
    const permsStr = parts[0].replace("PERMS:", "").trim();
    if (permsStr) {
      return permsStr.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }

  // Fallback for default role names when no explicit PERMS prefix exists
  if (roleName === "chuyen_vien") {
    return [
      "METHOD_MANAGE",
      "QUOTA_MANAGE",
      "TIMELINE_MANAGE",
      "COMBINATION_MANAGE",
      "MAJOR_MANAGE",
      "ARTICLE_MANAGE",
    ];
  }

  return [];
}

export function AdminPermissionProvider({
  role = "",
  roleMoTa = null,
  children,
}: {
  role?: string;
  roleMoTa?: string | null;
  children: React.ReactNode;
}) {
  const isSuperAdmin = role === "super_admin";

  const permissions = useMemo(() => {
    return parsePermissions(role, roleMoTa);
  }, [role, roleMoTa]);

  const hasPermission = useMemo(() => {
    return (perm: string) => {
      if (isSuperAdmin) return true;
      return permissions.includes(perm);
    };
  }, [isSuperAdmin, permissions]);

  return (
    <AdminPermissionContext.Provider
      value={{
        role,
        permissions,
        isSuperAdmin,
        hasPermission,
        canManage: hasPermission,
      }}
    >
      {children}
    </AdminPermissionContext.Provider>
  );
}

export function useAdminPermissions() {
  return useContext(AdminPermissionContext);
}
