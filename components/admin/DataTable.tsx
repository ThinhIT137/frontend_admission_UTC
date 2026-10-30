"use client";

import { AdminIcon } from "@/components/admin/AdminIcon";
import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T, index: number) => ReactNode);
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  emptyText?: string;
  onClickRow?: (row: T) => void;
  keyExtractor?: (row: T, index: number) => string | number;
  tableClassName?: string;
  actionClassName?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
  actions,
  emptyText = "Không tìm thấy dữ liệu phù hợp",
  onClickRow,
  keyExtractor,
  tableClassName = "",
  actionClassName = "",
}: DataTableProps<T>) {
  return (
    <div className="w-full bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`w-full text-left border-collapse ${tableClassName}`}>
          <thead>
            <tr className="bg-[#f1f5f9] border-b border-[#e2e8f0] text-[12px] font-bold text-[#192b59] font-stamp uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`py-3 px-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || actions) && (
                <th className={`py-3 px-4 text-right ${actionClassName}`}>Thao Tác</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-[13px] text-[#1e293b]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete || actions ? 1 : 0)}
                  className="py-8 text-center text-[#64748b]"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AdminIcon name="inbox" className="text-[36px] text-[#cbd5e1]" />
                    <p className="font-medium text-[14px]">{emptyText}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const rawKey = keyExtractor
                  ? keyExtractor(row, rowIdx)
                  : (row?.id ??
                     row?.ma_khoi_nganh ??
                     row?.ma_nganh ??
                     row?.ma_chuong_trinh ??
                     row?.ma_mon ??
                     row?.ma_to_hop ??
                     row?.ma_phuong_thuc ??
                     row?.ma_ls_dc ??
                     row?.ma_su_kien ??
                     row?.ma_bai_viet ??
                     row?.ma_tri_thuc ??
                     row?.ma_vai_tro ??
                     row?.ma_admin ??
                     row?.ma_ho_so ??
                     null);

                const finalKey = rawKey !== null && rawKey !== undefined 
                  ? `${String(rawKey)}-${rowIdx}` 
                  : `row-${rowIdx}`;

                return (
                  <tr
                    key={finalKey}
                    className={`hover:bg-[#f8fafc]/60 transition-colors font-medium ${onClickRow ? 'cursor-pointer' : ''}`}
                    onClick={() => onClickRow && onClickRow(row)}
                  >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3 px-4 ${col.className || ""}`}>
                      {typeof col.accessor === "function"
                        ? col.accessor(row, rowIdx)
                        : (row[col.accessor as keyof T] as ReactNode)}
                    </td>
                  ))}
                  {(onEdit || onDelete || actions) && (
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {actions && actions(row)}
                        {onEdit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                            className="p-1.5 text-[#192b59] hover:bg-[#eef2ff] rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            <AdminIcon name="edit" className="text-[18px]" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors"
                            title="Xóa"
                          >
                            <AdminIcon name="delete" className="text-[18px]" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}
