"use client";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { publicError } from "@/libs/client-error";
import { useAdminDialog } from "@/hooks/useAdminDialog";

import { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { saveKnowledge, deleteKnowledge } from "@/actions/content.action";
import { toast } from "@/libs/admin-toast";

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
  const detailDialogRef = useAdminDialog(!!viewingRow, () => setViewingRow(null));

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

  const [saving, setSaving] = useState(false);
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const row = await saveKnowledge({ id: editingRow?.ma_tri_thuc, topic, question, answer });
      setData(prev => editingRow ? prev.map(item => item.ma_tri_thuc === row.ma_tri_thuc ? row : item) : [row, ...prev]);
      toast.success("Đã lưu tri thức vào database");
      if (row.syncWarning) toast.warning(row.syncWarning);
      setIsModalOpen(false);
    } catch (err) { toast.error(publicError(err instanceof Error ? err.message : "Không thể lưu tri thức")); }
    finally { setSaving(false); }
  };
  const handleDelete = async () => {
    if (!deletingRow || saving) return;
    setSaving(true);
    try {
      const result = await deleteKnowledge(deletingRow.ma_tri_thuc);
      setData(prev => prev.filter(item => item.ma_tri_thuc !== deletingRow.ma_tri_thuc));
      setDeletingRow(null);
      toast.success("Đã xóa tri thức khỏi database");
      if (result.syncWarning) toast.warning(result.syncWarning);
    } catch (err) { toast.error(publicError(err instanceof Error ? err.message : "Không thể xóa tri thức")); }
    finally { setSaving(false); }
  };

  const columns: Column<TriThucAiItem>[] = [
    {
      header: "Chủ Đề Dữ Liệu",
      accessor: (r) => (
        <span className="max-w-full break-words px-2.5 py-1 rounded-md bg-[#eef2ff] text-[#192b59] font-bold text-[11px] font-stamp border border-[#cbd5e1] whitespace-normal inline-block [overflow-wrap:anywhere]">
          <span title={r.chu_de} className="line-clamp-2">{r.chu_de}</span>
        </span>
      ),
      className: "w-[18%] align-top",
    },
    {
      header: "Câu Hỏi Mẫu",
      accessor: (r) => (
        <div className="py-1">
          <button type="button"
            className="w-full text-left font-bold text-[#1e293b] block text-[14px] hover:text-[#192b59] [overflow-wrap:anywhere]"
            onClick={() => setViewingRow(r)}
          >
            <span title={r.cau_hoi_mau || undefined} className="line-clamp-3">{r.cau_hoi_mau || "Nội dung kiến thức chung"}</span>
          </button>
        </div>
      ),
      className: "w-[27%] align-top",
    },
    {
      header: "Nội Dung Trả Lời",
      accessor: (r) => (
        <p className="text-[13px] text-[#475569] line-clamp-3 [overflow-wrap:anywhere]">
          {r.noi_dung}
        </p>
      ),
      className: "align-top",
    },
    {
      header: "Trạng Thái",
      accessor: (r) => (
        <span className="max-w-full px-2.5 py-1 rounded-md bg-[#86efac]/40 text-[#14532d] border border-[#86efac] font-bold text-[10px] whitespace-normal inline-block">
          {r.trang_thai === "active" ? "ĐÃ HUẤN LUYỆN" : "ĐANG CẬP NHẬT"}
        </span>
      ),
      className: "w-[112px] text-center align-top",
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

  const uniqueTopics = Array.from(new Set(data.map((d) => d.chu_de).filter(Boolean))).sort((a,b) => a.localeCompare(b, "vi"));

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded bg-[#fdb712] text-[#192b59] font-stamp text-[11px] font-bold uppercase mb-2">
            Hệ Thống RAG AI Tư Vấn Tuyển Sinh
          </div>
          <h1 className="font-display font-black text-[28px] text-[#192b59] tracking-tight">
            Quản Lý Dữ Liệu Huấn Luyện Chatbot AI
          </h1>
          <p className="text-[14px] text-[#475569] mt-0.5">
            Kho {data.length} cơ sở tri thức (Knowledge Base) phục vụ phản hồi chuẩn xác cho thí sinh UTC.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] border transition-all ${
              isSimulatorOpen
                ? "bg-[#192b59] text-white border-[#192b59]"
                : "bg-white text-[#192b59] border-[#cbd5e1] hover:bg-[#f8fafc]"
            }`}
          >
            <AdminIcon name="psychology" className="text-[18px]" />
            {isSimulatorOpen ? "Đóng Giả Lập Prompt" : "Thử Nghiệm Prompt AI"}
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#fdb712] hover:bg-[#e2a20a] text-[#192b59] px-4 py-2.5 rounded-xl font-black text-[13px] shadow-sm transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          >
            <AdminIcon name="add_circle" className="text-[18px]" />
            Thêm Tri Thức
          </button>
        </div>
      </div>

      {/* Interactive AI Prompt Simulator Sandbox */}
      {isSimulatorOpen && (
        <div className="p-5 bg-gradient-to-br from-[#192b59] to-[#1e293b] rounded-2xl text-white shadow-xl space-y-4 border border-[#3b82f6]/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <AdminIcon name="smart_toy" className="text-[#fdb712] text-[22px]" />
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
                className="px-5 py-2.5 bg-[#fdb712] hover:bg-[#e2a20a] text-[#192b59] font-black text-[13px] rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <AdminIcon name="play_arrow" className="text-[18px]" />
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fdb712] text-[#192b59]">
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
      <section aria-label="Tìm kiếm và lọc tri thức" className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="block min-w-0 text-sm font-semibold text-slate-600">Tìm kiếm tri thức
        <div className="relative mt-2 w-full">
          <AdminIcon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[20px]" />
          <input
            type="search"
            aria-label="Tìm kiếm tri thức"
            placeholder="Tìm theo chủ đề, câu hỏi mẫu hoặc câu trả lời..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-[14px] font-medium outline-none focus:border-[#192b59] focus:ring-2 focus:ring-[#192b59]/20 transition-all shadow-sm"
          />
        </div></label>
        <div className="grid min-w-0 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="block min-w-0 text-sm font-semibold text-slate-600">Lọc theo chủ đề
            <select aria-label="Lọc theo chủ đề" title={selectedTopic === "ALL" ? "Tất cả chủ đề" : selectedTopic} value={selectedTopic} onChange={event => setSelectedTopic(event.target.value)}
              className="mt-2 block min-h-11 w-full min-w-0 max-w-full truncate rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-blue-950">
              <option value="ALL">Tất cả chủ đề ({uniqueTopics.length})</option>
              {uniqueTopics.map(topic => <option key={topic} value={topic} title={topic}>{topic.length > 100 ? `${topic.slice(0,97)}…` : topic}</option>)}
            </select>
          </label>
          <p role="status" className="pb-2 text-sm text-slate-500">Hiển thị {filteredData.length}/{data.length} mục</p>
        </div>
        {selectedTopic !== "ALL" && <p title={selectedTopic} className="line-clamp-2 text-xs text-slate-500 [overflow-wrap:anywhere]">Chủ đề: {selectedTopic}</p>}
      </section>

      {/* Data Table */}
      <div className="hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm lg:block">
        <DataTable
          tableClassName="table-fixed"
          actionClassName="w-[104px]"
          columns={columns}
          data={filteredData}
          onEdit={openEdit}
          onDelete={(row) => setDeletingRow(row)}
        />
      </div>
      <div className="space-y-3 lg:hidden">
        {!filteredData.length && <p className="rounded-xl border bg-white p-6 text-center text-slate-500">Không có tri thức phù hợp</p>}
        {filteredData.map(row => <article key={row.ma_tri_thuc} data-knowledge-id={row.ma_tri_thuc} className="min-w-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2 text-xs"><span className="max-w-full rounded-lg bg-blue-50 p-2 font-bold text-blue-950 [overflow-wrap:anywhere]"><span title={row.chu_de} className="line-clamp-2">{row.chu_de}</span></span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-900">{row.trang_thai === "active" ? "ĐÃ HUẤN LUYỆN" : "ĐANG CẬP NHẬT"}</span></div>
          <button type="button" onClick={() => setViewingRow(row)} className="block w-full text-left font-bold text-blue-950"><span className="line-clamp-3 [overflow-wrap:anywhere]">{row.cau_hoi_mau || "Nội dung kiến thức chung"}</span></button>
          <p className="line-clamp-3 text-sm text-slate-600 [overflow-wrap:anywhere]">{row.noi_dung}</p>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" disabled={saving} onClick={() => openEdit(row)} className="min-h-11 rounded-lg border border-blue-200 px-4 font-semibold text-blue-950">Sửa</button>
            <button type="button" disabled={saving} onClick={() => setDeletingRow(row)} className="min-h-11 rounded-lg border border-red-200 px-4 font-semibold text-red-700">Xóa</button></div>
        </article>)}
      </div>

      {/* View Detail Modal */}
      {viewingRow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e293b]/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div ref={detailDialogRef} role="dialog" aria-modal="true" aria-label="Chi tiết tri thức AI" tabIndex={-1} className="bg-[#f6f8fc] min-w-0 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto border border-[#e2e8f0] p-4 sm:p-6 space-y-4 [overflow-wrap:anywhere]">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <span className="px-2.5 py-0.5 rounded bg-[#eef2ff] text-[#192b59] font-bold text-[11px]">
                {viewingRow.chu_de}
              </span>
              <button
                type="button" aria-label="Đóng chi tiết tri thức AI" onClick={() => setViewingRow(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] text-[#64748b]"
              >
                <AdminIcon name="close" className="text-[18px]" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#64748b] mb-1">
                Câu Hỏi Mẫu:
              </label>
              <h3 className="font-bold text-[16px] text-[#192b59]">
                {viewingRow.cau_hoi_mau || "Kiến thức chung"}
              </h3>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#64748b] mb-1">
                Nội Dung Phản Hồi Trợ Lý AI:
              </label>
              <div className="p-4 bg-white border border-[#e2e8f0] rounded-xl text-[14px] text-[#1e293b] leading-relaxed whitespace-pre-line">
                {viewingRow.noi_dung}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingRow(null)}
                className="px-4 py-2 bg-[#192b59] text-white rounded-xl text-[13px] font-bold"
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
            <label className="block text-[12px] font-bold mb-1 text-[#475569] uppercase tracking-wider">
              Chủ Đề Dữ Liệu:
            </label>
            <input
              type="text"
              required
              placeholder="VD: Điểm Chuẩn & Chỉ Tiêu, Quy Đổi IELTS..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[14px] font-bold text-[#192b59] outline-none focus:border-[#192b59]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#475569] uppercase tracking-wider">
              Câu Hỏi Mẫu (User Query):
            </label>
            <input
              type="text"
              placeholder="VD: Điểm chuẩn ngành CNTT năm vừa qua là bao nhiêu?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[14px] text-[#1e293b] outline-none focus:border-[#192b59]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1 text-[#475569] uppercase tracking-wider">
              Câu Trả Lời Chuẩn Phản Hồi AI (Ground Truth) <span className="text-red-500">*</span>:
            </label>
            <textarea
              rows={4}
              required
              placeholder="Nhập thông tin câu trả lời chính xác để AI căn cứ phản hồi..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[14px] text-[#1e293b] outline-none focus:border-[#192b59] resize-none leading-relaxed"
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
