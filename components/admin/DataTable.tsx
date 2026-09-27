"use client";

import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  emptyText?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
  actions,
  emptyText = "Không tìm thấy dữ liệu phù hợp",
}: DataTableProps<T>) {
  return (
    <div className="w-full bg-white rounded-xl border border-[#e9e2d5] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f4ede0] border-b border-[#e9e2d5] text-[12px] font-bold text-[#0d1b4e] font-stamp uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`py-3 px-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || actions) && (
                <th className="py-3 px-4 text-right">Thao Tác</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e9e2d5] text-[13px] text-[#1e1b14]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete || actions ? 1 : 0)}
                  className="py-8 text-center text-[#767680]"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-[#c6c5d0]">
                      inbox
                    </span>
                    <p className="font-medium text-[14px]">{emptyText}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={
                    row.id ??
                    row.ma_nganh ??
                    row.ma_chuong_trinh ??
                    row.ma_to_hop ??
                    row.ma_phuong_thuc ??
                    row.ma_su_kien ??
                    row.ma_bai_viet ??
                    row.ma_tri_thuc ??
                    rowIdx
                  }
                  className="hover:bg-[#faf3e6]/60 transition-colors font-medium"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3 px-4 ${col.className || ""}`}>
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as ReactNode)}
                    </td>
                  ))}
                  {(onEdit || onDelete || actions) && (
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {actions && actions(row)}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1.5 text-[#0d1b4e] hover:bg-[#dde1ff] rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
