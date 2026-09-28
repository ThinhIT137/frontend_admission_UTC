"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface FAQKbData {
  id: string;
  topic: string;
  question: string;
  answer: string;
  status: "ACTIVE" | "TRAINING";
}

const initialKbData: FAQKbData[] = [
  { id: "1", topic: "Điểm Chuẩn & Chỉ Tiêu", question: "Điểm chuẩn ngành CNTT năm 2025 là bao nhiêu?", answer: "Ngành Công nghệ Thông tin (mã ngành 7480201) năm 2025 có điểm chuẩn xét tuyển THPT là 25.85 điểm.", status: "ACTIVE" },
  { id: "2", topic: "Chứng Chỉ & Quy Đổi", question: "Bằng IELTS 6.5 quy đổi thành bao nhiêu điểm Tiếng Anh?", answer: "Chứng chỉ IELTS 6.5 trở lên được quy đổi thành 10.0 điểm môn Tiếng Anh trong tổ hợp xét tuyển UTC.", status: "ACTIVE" },
  { id: "3", topic: "Hồ Sơ & Thủ Tục", question: "Thời gian nộp hồ sơ xét tuyển sớm K66 là khi nào?", answer: "Hạn chót nộp hồ sơ xét tuyển kết hợp đợt 1 kéo dài từ 01/03/2026 đến hết 30/05/2026.", status: "ACTIVE" },
];

export default function ChatbotKbAdminPage() {
  const [data, setData] = useState<FAQKbData[]>(initialKbData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FAQKbData | null>(null);
  const [deletingRow, setDeletingRow] = useState<FAQKbData | null>(null);

  const [topic, setTopic] = useState("Điểm Chuẩn & Chỉ Tiêu");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const openCreate = () => {
    setEditingRow(null);
    setTopic("Điểm Chuẩn & Chỉ Tiêu");
    setQuestion("");
    setAnswer("");
    setIsModalOpen(true);
  };

  const openEdit = (row: FAQKbData) => {
    setEditingRow(row);
    setTopic(row.topic);
    setQuestion(row.question);
    setAnswer(row.answer);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRow) {
      setData((prev) =>
        prev.map((item) => (item.id === editingRow.id ? { ...item, topic, question, answer } : item))
      );
    } else {
      setData((prev) => [
        { id: Date.now().toString(), topic, question, answer, status: "ACTIVE" },
        ...prev,
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingRow) return;
    setData((prev) => prev.filter((item) => item.id !== deletingRow.id));
    setDeletingRow(null);
  };

  const columns: Column<FAQKbData>[] = [
    { header: "Chủ Đề Dữ Liệu", accessor: (r) => <span className="px-2 py-0.5 rounded bg-[#dde1ff] text-[#0d1b4e] font-bold text-[11px] font-stamp">{r.topic}</span> },
    { header: "Câu Hỏi Mẫu (Prompt)", accessor: (r) => <span className="font-bold text-[#1e1b14] block">{r.question}</span> },
    { header: "Phản Hồi Chuẩn Trợ Lý AI (Ground Truth)", accessor: (r) => <span className="text-[12px] text-[#45464f] line-clamp-2">{r.answer}</span> },
    { header: "Trạng Thái AI", accessor: (r) => <span className="px-2 py-0.5 rounded bg-[#86efac] text-[#111827] font-bold text-[10px]">ĐÃ HUẤN LUYỆN</span> },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#0d1b4e]">Quản Lý Dữ Liệu Huấn Luyện Chatbot AI</h1>
          <p className="text-[13px] text-[#45464f]">Quản lý kho Knowledge Base (FAQ/RAG) để trợ lý AI tư vấn chuẩn xác cho thí sinh.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#fdb712] text-[#0d1b4e] px-4 py-2.5 rounded-xl font-bold text-[13px]">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Thêm Dữ Liệu KB Mới
        </button>
      </div>

      <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={(row) => setDeletingRow(row)} />

      <ModalForm isOpen={isModalOpen} title={editingRow ? "Sửa Dữ Liệu AI" : "Thêm Dữ Liệu KB Mới"} onClose={() => setIsModalOpen(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1">Chủ Đề Dữ Liệu:</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px] font-bold">
              <option value="Điểm Chuẩn & Chỉ Tiêu">Điểm Chuẩn & Chỉ Tiêu</option>
              <option value="Chứng Chỉ & Quy Đổi">Chứng Chỉ & Quy Đổi</option>
              <option value="Hồ Sơ & Thủ Tục">Hồ Sơ & Thủ Tục</option>
              <option value="Học Phí & Học Bổng">Học Phí & Học Bổng</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1">Câu Hỏi Thường Gặp (User Query):</label>
            <input type="text" required value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-1">Câu Trả Lời Chuẩn Phản Hồi AI (Ground Truth):</label>
            <textarea rows={4} required value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full px-3 py-2 bg-[#faf3e6] border border-[#c6c5d0] rounded-lg text-[13px]" />
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog isOpen={!!deletingRow} title="Xác Nhận Xóa Dữ Liệu AI" message={`Bạn có chắc muốn xóa dữ liệu KB "${deletingRow?.question}"?`} onConfirm={handleDelete} onCancel={() => setDeletingRow(null)} />
    </div>
  );
}
