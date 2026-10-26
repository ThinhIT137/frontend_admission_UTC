export const normalizeSubject = (value: string) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, "");
export const isMath = (value: string) =>
    ["toan", "toanhoc", "math", "mathematics"].includes(
        normalizeSubject(value),
    );
export type SubjectScore = { code: string; name: string; score: number };
export interface Benchmark {
    diem: number;
    ma_phuong_thuc: string;
    phuong_thuc?: { ten_phuong_thuc: string } | null;
    dieu_kien_mon?: unknown;
    diem_uu_tien_toi_thieu?: number | null;
    nguyen_vong_toi_da?: number | null;
}
export type Calculation = {
    method: "THPT" | "HOC_BA" | "CHUNG_CHI" | "DGNL";
    finalScore: number;
    passPreliminary: boolean;
    subjects: SubjectScore[];
};

// Tên phương thức là kiểm tra bổ sung: không xem PT3 là chứng chỉ hoặc PT4 là HSA.
export function matchesMethod(
    benchmark: Benchmark,
    method: Calculation["method"],
) {
    const name = normalizeSubject(benchmark.phuong_thuc?.ten_phuong_thuc ?? "");
    const code = benchmark.ma_phuong_thuc.toUpperCase();
    if (method === "DGNL") return false; // CSDL chưa cung cấp thang điểm/quy đổi theo năm để đối chiếu an toàn.
    const named = /hocba/.test(name)
        ? "HOC_BA"
        : /chungchi|kethop/.test(name)
          ? "CHUNG_CHI"
          : /dgnl|dgtd|nangluc|tuduy|hsa|tsa/.test(name)
            ? "DGNL"
            : /thpt|totnghiep/.test(name)
              ? "THPT"
              : null;
    if (named) return named === method;
    return (
        (method === "THPT" && ["PT1", "100"].includes(code)) ||
        (method === "HOC_BA" && ["PT2", "200"].includes(code)) ||
        (method === "CHUNG_CHI" && code === "402")
    );
}

export function evaluateBenchmark(
    calculation: Calculation,
    benchmark: Benchmark | undefined,
) {
    let chance: "high" | "medium" | "low" | "ineligible" | "unknown" =
        "unknown";
    let reason =
        "Chưa đủ dữ liệu cùng năm, phương thức và thang điểm để đối chiếu.";
    if (!calculation.passPreliminary)
        return {
            chance: "ineligible" as const,
            reason: "Chưa đạt điều kiện sơ bộ; không đánh giá cơ hội trúng tuyển.",
            diff: null,
        };
    // Form chứng chỉ chưa xác định rõ môn được thay thế theo từng tổ hợp/năm.
    // Không coi tổng minh họa là điểm của A00 hay tự gán môn thứ hai/tiếng Anh.
    if (calculation.method === "CHUNG_CHI")
        return {
            chance,
            reason: "Chưa có cấu hình môn và chứng chỉ thay thế cho tổ hợp theo năm để đối chiếu.",
            diff: null,
        };
    if (
        !benchmark ||
        !Number.isFinite(benchmark.diem) ||
        benchmark.diem <= 0 ||
        benchmark.diem > 30
    )
        return { chance, reason, diff: null };
    const conditions = benchmark.dieu_kien_mon;
    let unknown = false;
    if (conditions !== null && conditions !== undefined) {
        if (typeof conditions !== "object" || Array.isArray(conditions))
            unknown = true;
        else
            for (const [key, minimum] of Object.entries(conditions)) {
                if (
                    typeof minimum !== "number" ||
                    !Number.isFinite(minimum) ||
                    minimum < 0 ||
                    minimum > 10
                ) {
                    unknown = true;
                    continue;
                }
                const subject = calculation.subjects.find(
                    (item) =>
                        normalizeSubject(item.code) === normalizeSubject(key) ||
                        normalizeSubject(item.name) === normalizeSubject(key) ||
                        (isMath(key) &&
                            (isMath(item.name) || isMath(item.code))),
                );
                if (!subject) {
                    unknown = true;
                    continue;
                }
                if (subject.score < minimum)
                    return {
                        chance: "ineligible" as const,
                        reason: `${subject.name}: ${subject.score} < ${minimum}, chưa đạt điều kiện môn đã lưu.`,
                        diff: null,
                    };
            }
    }
    // Các tiêu chí phụ cần thông tin hồ sơ/nguyện vọng; công cụ điểm chưa thu thập đủ.
    if (
        benchmark.nguyen_vong_toi_da != null ||
        (benchmark.diem_uu_tien_toi_thieu != null &&
            benchmark.diem_uu_tien_toi_thieu !== 0)
    )
        unknown = true;
    if (unknown)
        return {
            chance,
            reason: "Cần kiểm tra thêm điều kiện môn hoặc tiêu chí phụ trong đề án.",
            diff: null,
        };
    const diff = Number((calculation.finalScore - benchmark.diem).toFixed(2));
    chance = diff >= 0.5 ? "high" : diff >= -0.5 ? "medium" : "low";
    reason = "Chỉ đối chiếu điểm lịch sử, không phải kết luận đỗ/trượt.";
    return { chance, reason, diff };
}
