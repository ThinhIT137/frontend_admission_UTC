"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";

export interface TriThucAiItem {
  ma_tri_thuc: string;
  chu_de: string;
  cau_hoi_mau?: string | null;
  noi_dung: string;
  trang_thai: string;
  create_at?: Date | string;
  admin?: {
    ho_ten?: string;
  };
}

export default function ChatbotKbClient({ initialData }: { initialData: TriThucAiItem[] }) {
  const [data, setData] = useState<TriThucAiItem[]>(initialData);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<TriThucAiItem | null>(null);
  const [deletingRow, setDeletingRow] = useState<TriThucAiItem | null>(null);
  const [viewingRow, setViewingRow] = useState<TriThucAiItem | null>(null);

  const [topic, setTopic] = useState("Điểm Chuẩn & Chỉ Tiêu");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const filteredData = data.filter((item) => {
    const matchSearch =
      (item.cau_hoi_mau?.toLowerCase() || "").includes(search.toLowerCase()) ||
      item.noi_dung.toLowerCase().includes(search.toLowerCase()) ||
      item.chu_de.toLowerCase().includes(search.toLowerCase());
    const matchTopic = selectedTopic === "ALL" || item.chu_de === selectedTopic;
    return matchSearch && matchTopic;
  });

  const openCreate = () => {
    setEditingRow(null);
    setTopic("Điểm Chuẩn & Chỉ Tiêu");
    setQuestion("");
    setAnswer("");
    setIsModalOpen(true);
  };

  const openEdit = (row: TriThucAiItem) => {
    setEditingRow(row);
    setTopic(row.chu_de);
    setQuestion(row.cau_hoi_mau || "");
    setAnswer(row.noi_dung);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      toast.error("Vui lòng nhập nội dung câu trả lời chuẩn!");
      return;
    }

    if (editingRow) {
      setData((prev) =>
        prev.map((item) =>
          item.ma_tri_thuc === editingRow.ma_tri_thuc
            ? {
                ...item,
                chu_de: topic,
                cau_hoi_mau: question,
                noi_dung: answer,
              }
            : item
        )
      );
      toast.success("Cập nhật tri thức AI thành công!");
    } else {
      const newItem: TriThucAiItem = {
        ma_tri_thuc: Date.now().toString(),
        chu_de: topic,
        cau_hoi_mau: question || "Câu hỏi thường gặp",
        noi_dung: answer,
        trang_thai: "active",
        create_at: new Date().toISOString(),
      };
      setData((prev) => [newItem, ...prev]);
      toast.success("Thêm mới bộ tri thức AI thành công!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingRow) return;
    setData((prev) => prev.filter((item) => item.ma_tri_thuc !== deletingRow.ma_tri_thuc));
    toast.success("Đã xóa mục tri thức AI!");
    setDeletingRow(null);
  };

  const columns: Column<TriThucAiItem>[] = [
    {
      header: "Chủ Đề Dữ Liệu",
      accessor: (r) => (
        <span className="px-2.5 py-1 rounded-md bg-[#dde1ff] text-[#0d1b4e] font-bold text-[11px] font-stamp border border-[#c6c5d0] whitespace-nowrap inline-block">
          {r.chu_de}
        </span>
      ),
      className: "w-[160px]",
    },
    {
      header: "Câu Hỏi Mẫu (User Prompt)",
      accessor: (r) => (
        <div className="py-1">
          <span
            className="font-bold text-[#1e1b14] block text-[14px] hover:text-[#0d1b4e] cursor-pointer"
            onClick={() => setViewingRow(r)}
          >
            {r.cau_hoi_mau || "Nội dung kiến thức chung"}
          </span>
        </div>
      ),
      className: "w-[300px]",
    },
    {
      header: "Nội Dung Phản Hồi Chuẩn (Ground Truth)",
      accessor: (r) => (
        <p className="text-[13px] text-[#45464f] line-clamp-2 max-w-xl">
          {r.noi_dung}
        </p>
      ),
      className: "w-full",
    },
    {
      header: "Trạng Thái",
      accessor: (r) => (
        <span className="px-2.5 py-1 rounded-md bg-[#86efac]/40 text-[#14532d] border border-[#86efac] font-bold text-[10px] whitespace-nowrap inline-block">
          {r.trang_thai === "active" ? "ĐÃ HUẤN LUYỆN" : "ĐANG CẬP NHẬT"}
        </span>
      ),
      className: "w-[130px] text-center",
    },
  ];

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [testQuery, setTestQuery] = useState("");
  const [simulatorResult, setSimulatorResult] = useState<{
    matched: TriThucAiItem | null;
    score: number;
    notes: string;
  } | null>(null);

  const runTestPrompt = (queryToTest?: string) => {
    const q = (queryToTest !== undefined ? queryToTest : testQuery).trim().toLowerCase();
    if (!q) {
      toast.error("Vui lòng nhập câu hỏi thí sinh để kiểm thử!");
      return;
    }

    if (queryToTest) setTestQuery(queryToTest);

    // Tìm kiếm tương đồng dựa trên từ khóa trong câu hỏi mẫu & nội dung
    const qWords = q.split(/\s+/).filter((w) => w.length > 1);
    let bestMatch: TriThucAiItem | null = null;
    let maxMatchedWords = 0;

    data.forEach((item) => {
      const targetText = `${item.cau_hoi_mau || ""} ${item.noi_dung} ${item.chu_de}`.toLowerCase();
      let matchedCount = 0;
      qWords.forEach((word) => {
        if (targetText.includes(word)) matchedCount++;
      });
      if (matchedCount > maxMatchedWords) {
        maxMatchedWords = matchedCount;
        bestMatch = item;
      }
    });

    const confidence = qWords.length > 0 ? Math.min(Math.round((maxMatchedWords / qWords.length) * 100), 98) : 50;

    setSimulatorResult({
      matched: bestMatch,
      score: bestMatch ? Math.max(confidence, 65) : 0,
      notes: bestMatch
        ? `Khớp ${maxMatchedWords}/${qWords.length} từ khóa chính từ tập tri thức RAG Supabase`
        : "Không tìm thấy tri thức phù hợp trong DB, AI sẽ dùng kiến thức dự phòng.",
    });
  };

  const uniqueTopics = Array.from(new Set(initialData.map((d) => d.chu_de).filter(Boolean)));

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded bg-[#fdb712] text-[#0d1b4e] font-stamp text-[11px] font-bold uppercase mb-2">
            Hệ Thống RAG AI Tư Vấn Tuyển Sinh
          </div>
          <h1 className="font-display font-black text-[28px] text-[#0d1b4e] tracking-tight">
            Quản Lý Dữ Liệu Huấn Luyện Chatbot AI
          </h1>
          <p className="text-[14px] text-[#45464f] mt-0.5">
            Kho {data.length} cơ sở tri thức (Knowledge Base) phục vụ phản hồi chuẩn xác cho thí sinh UTC.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] border transition-all ${
              isSimulatorOpen
                ? "bg-[#0d1b4e] text-white border-[#0d1b4e]"
                : "bg-white text-[#0d1b4e] border-[#c6c5d0] hover:bg-[#faf3e6]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            {isSimulatorOpen ? "Đóng Giả Lập Prompt" : "Thử Nghiệm Prompt AI"}
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] px-4 py-2.5 rounded-xl font-black text-[13px] shadow-sm transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Thêm Tri Thức
          </button>
        </div>
      </div>

      {/* Interactive AI Prompt Simulator Sandbox */}
      {isSimulatorOpen && (
        <div className="p-5 bg-gradient-to-br from-[#0d1b4e] to-[#1e293b] rounded-2xl text-white shadow-xl space-y-4 border border-[#3b82f6]/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fdb712] text-[22px]">smart_toy</span>
              <h3 className="font-display font-bold text-[16px] text-white">
                Mô Phỏng Trực Quan Bộ Khớp Tri Thức RAG (Prompt Simulator)
              </h3>
            </div>
            <span className="text-[11px] font-mono bg-white/10 text-slate-300 px-2 py-0.5 rounded">
              Vector / Full-Text RAG Test
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-slate-300">
              Nhập câu hỏi thí sinh thực tế để kiểm tra tri thức kích hoạt:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="VD: Bằng IELTS 6.5 quy đổi được bao nhiêu điểm tiếng Anh?"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runTestPrompt()}
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-[14px] outline-none focus:border-[#fdb712]"
              />
              <button
                onClick={() => runTestPrompt()}
                className="px-5 py-2.5 bg-[#fdb712] hover:bg-[#e2a20a] text-[#0d1b4e] font-black text-[13px] rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Kiểm Thử
              </button>
            </div>

            {/* Quick Prompts Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-semibold">Câu hỏi mẫu thử nhanh:</span>
              {[
                "Điểm chuẩn ngành CNTT năm 2025?",
                "Bằng IELTS 6.5 quy đổi ra sao?",
                "Học phí chương trình chất lượng cao?",
                "Thời gian nộp hồ sơ xét tuyển sớm K66?",
              ].map((sample) => (
                <button
                  key={sample}
                  onClick={() => runTestPrompt(sample)}
                  className="text-[11px] px-2.5 py-0.5 bg-white/10 hover:bg-white/20 rounded-full text-slate-200 transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Test Result Display */}
          {simulatorResult && (
            <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-slate-300 uppercase">Độ Khớp Tri Thức:</span>
                  <span
                    className={`font-mono font-extrabold px-2 py-0.5 rounded text-[12px] ${
                      simulatorResult.score >= 70
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {simulatorResult.score}% Khớp
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{simulatorResult.notes}</span>
              </div>

              {simulatorResult.matched ? (
                <div className="space-y-2 bg-black/25 p-3 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fdb712] text-[#0d1b4e]">
                      {simulatorResult.matched.chu_de}
                    </span>
                    <span className="text-[13px] font-bold text-white">
                      {simulatorResult.matched.cau_hoi_mau}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-200 leading-relaxed whitespace-pre-line pl-1 border-l-2 border-[#fdb712]">
                    {simulatorResult.matched.noi_dung}
                  </p>
                </div>
              ) : (
                <p className="text-[13px] text-amber-300 italic">
                  Không tìm thấy mục tri thức phù hợp. Hãy bổ sung thêm tri thức mới cho chủ đề này!
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767680] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo chủ đề, câu hỏi mẫu hoặc câu trả lời..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c6c5d0] rounded-xl text-[14px] font-medium outline-none focus:border-[#0d1b4e] focus:ring-2 focus:ring-[#0d1b4e]/20 transition-all shadow-sm"
          />
        </div>

        {/* Topics Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-[#faf3e6] rounded-xl border border-[#e9e2d5]">
          <button
            onClick={() => setSelectedTopic("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${
              selectedTopic === "ALL"
                ? "bg-[#0d1b4e] text-white shadow-sm"
                : "text-[#45464f] hover:bg-white/60"
            }`}
          >
            Tất Cả Chủ Đề ({data.length})
          </button>
          {uniqueTopics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${
                selectedTopic === t
                  ? "bg-[#0d1b4e] text-white shadow-sm"
                  : "text-[#45464f] hover:bg-white/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e9e2d5] overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          onEdit={openEdit}
          onDelete={(row) => setDeletingRow(row)}
        />
      </div>

      {/* View Detail Modal */}
      {viewingRow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e1b14]/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#fff9ee] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#e9e2d5] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e9e2d5] pb-3">
              <span className="px-2.5 py-0.5 rounded bg-[#dde1ff] text-[#0d1b4e] font-bold text-[11px]">
                {viewingRow.chu_de}
              </span>
              <button
                onClick={() => setViewingRow(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f4ede0] text-[#767680]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#767680] mb-1">
                Câu Hỏi Mẫu:
              </label>
              <h3 className="font-bold text-[16px] text-[#0d1b4e]">
                {viewingRow.cau_hoi_mau || "Kiến thức chung"}
              </h3>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#767680] mb-1">
                Nội Dung Phản Hồi Trợ Lý AI:
              </label>
              <div className="p-4 bg-white border border-[#e9e2d5] rounded-xl text-[14px] text-[#1e1b14] leading-relaxed whitespace-pre-line">
                {viewingRow.noi_dung}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingRow(null)}
                className="px-4 py-2 bg-[#0d1b4e] text-white rounded-xl text-[13px] font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Add / Edit */}
      <ModalForm
        isOpen={isModalOpen}
        title={editingRow ? "Chỉnh Sửa Tri Thức AI" : "Thêm Tri Thức Huấn Luyện Mới"}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#45464f] uppercase tracking-wider">
              Chủ Đề Dữ Liệu:
            </label>
            <input
              type="text"
              required
              placeholder="VD: Điểm Chuẩn & Chỉ Tiêu, Quy Đổi IELTS..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-xl text-[14px] font-bold text-[#0d1b4e] outline-none focus:border-[#0d1b4e]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#45464f] uppercase tracking-wider">
              Câu Hỏi Mẫu (User Query):
            </label>
            <input
              type="text"
              placeholder="VD: Điểm chuẩn ngành CNTT năm vừa qua là bao nhiêu?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-xl text-[14px] text-[#1e1b14] outline-none focus:border-[#0d1b4e]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#45464f] uppercase tracking-wider">
              Câu Trả Lời Chuẩn Phản Hồi AI (Ground Truth) <span className="text-red-500">*</span>:
            </label>
            <textarea
              rows={4}
              required
              placeholder="Nhập thông tin câu trả lời chính xác để AI căn cứ phản hồi..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#faf3e6] border border-[#c6c5d0] rounded-xl text-[14px] text-[#1e1b14] outline-none focus:border-[#0d1b4e] resize-none leading-relaxed"
            />
          </div>
        </div>
      </ModalForm>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingRow}
        title="Xác Nhận Xóa Dữ Liệu AI"
        message={`Bạn có chắc muốn xóa tri thức "${deletingRow?.cau_hoi_mau || deletingRow?.chu_de}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingRow(null)}
      />
    </div>
  );
}
