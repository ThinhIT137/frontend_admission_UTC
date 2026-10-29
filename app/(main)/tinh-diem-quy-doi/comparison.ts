import type { ProgramScoreItem } from "./TinhDiemQuyDoiClient";
import { programFamilies } from "./program-history";

export type PointBand = "high" | "medium" | "low";
export type SubjectSnapshot = { code: string; name: string; score: number };
export type CalculationSnapshot = {
    contractVersion?: string;
    actualMethod?: string;
    certificateBonus?: number;
    variants?: Record<string, { rawScore: number; finalScore: number | null; priorityBonus: number; passPreliminary: boolean; eligibilityStatus?: "pending" | "met" | "not_met"; preliminaryNotes: string[] }>;
    eligibilityStatus?: "pending" | "met" | "not_met";
    method: "THPT" | "HOC_BA" | "CHUNG_CHI" | "DGNL";
    rawScore: number;
    priorityBonus: number;
    maxPriority: number;
    finalScore: number | null;
    subDetails: { label: string; score: string }[];
    passPreliminary: boolean;
    preliminaryNotes: string[];
    combinationCode: string;
    subjects: SubjectSnapshot[];
    calculationYear: number;
};
export type AiBenchmark = {
    ma_chuong_trinh: string;
    diem_du_doan_2026: number;
    phuong_thuc_quy_doi?: { pt1_thpt?: number };
};
export type ComparisonRow = {
    personalScore?: number | null;
    ma_chuong_trinh: string;
    ten_chuong_trinh: string;
    ma_nganh: string;
    ten_nganh: string;
    faculty: string;
    benchmarkYear: number;
    benchmarkScore: number | null;
    predictionScore: number | null;
    previousScore: number | null;
    matchedMethodName: string;
    diff: number | null;
    chance: PointBand | "unknown" | "ineligible";
    pointBand: PointBand | null;
    reason: string;
    sourceCodes: string[];
    benchmarkSourceCode: string | null;
    previousSourceCode: string | null;
    previousConflict: boolean;
};
const normalized = (value: string) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, "");
const validScore = (value: unknown): value is number =>
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= 30;
export type ReferenceSource = "official" | "ai" | "missing";
export function referenceSource(row: ComparisonRow): ReferenceSource {
    return validScore(row.benchmarkScore)
        ? "official"
        : validScore(row.predictionScore)
          ? "ai"
          : "missing";
}
function official(program: ProgramScoreItem, year: number) {
    return program.lich_su_diem_chuan
        ?.find((item) => item.nam === year)
        ?.diem_trung_tuyen.find((item) => {
            const name = normalized(item.phuong_thuc?.ten_phuong_thuc ?? "");
            return (
                validScore(item.diem) &&
                (name
                    ? /thpt|totnghiep/.test(name) &&
                      !/hocba|nangluc|tuduy|kethop|chungchi|dgnl|dgtd|hsa|tsa/.test(
                          name,
                      )
                    : ["PT1", "100"].includes(
                          item.ma_phuong_thuc.toUpperCase(),
                      ))
            );
        });
}

function familyOfficial(
    members: ProgramScoreItem[],
    year: number,
    preferred: string,
) {
    const candidates = members.flatMap((program) => {
        const record = official(program, year);
        return record ? [{ program, record }] : [];
    });
    const conflict =
        new Set(candidates.map((item) => item.record.diem)).size > 1;
    const selected =
        candidates.find((item) => item.program.ma_chuong_trinh === preferred) ??
        candidates[0];
    return {
        conflict,
        record: conflict ? undefined : selected?.record,
        program: conflict ? undefined : selected?.program,
    };
}

/** Kiểm tra dữ liệu chính thức đã tải trước khi quyết định gọi dự đoán AI. */
export function yearReferenceAvailability(
    programs: ProgramScoreItem[],
    year: number,
) {
    return programFamilies(programs, year).reduce(
        (counts, { members, program }) => {
            const current = familyOfficial(
                members,
                year,
                program.ma_chuong_trinh,
            );
            counts.total += 1;
            if (current.record) counts.official += 1;
            else if (!current.conflict) counts.missing += 1;
            return counts;
        },
        { total: 0, official: 0, missing: 0 },
    );
}

/** Chỉ đối soát dữ liệu đã tải: không có API, quy đổi điểm hoặc cộng ưu tiên ở đây. */
export function comparePrograms(
    programs: ProgramScoreItem[],
    calculation: CalculationSnapshot,
    year: number,
    ai: AiBenchmark[],
): ComparisonRow[] {
    const predictions = new Map(
        ai
            .filter(
                (item) =>
                    item &&
                    typeof item.ma_chuong_trinh === "string" &&
                    validScore(item.diem_du_doan_2026),
            )
            .map((item) => [item.ma_chuong_trinh, item.diem_du_doan_2026]),
    );
    return programFamilies(programs, year)
        .map(({ members, program }) => {
            const current = familyOfficial(
                members,
                year,
                program.ma_chuong_trinh,
            );
            const historical = familyOfficial(
                members,
                year - 1,
                program.ma_chuong_trinh,
            );
            const benchmark = current.record;
            const previous = historical.record;
            // API AI hiện công bố đúng năm 2026/thang THPT; không đổi nhãn sang năm khác.
            const aliasPredictions = [
                ...new Set(
                    members.flatMap((member) => {
                        const value = predictions.get(member.ma_chuong_trinh);
                        return value === undefined ? [] : [value];
                    }),
                ),
            ];
            const predictionScore =
                year === 2026 && !current.conflict
                    ? (predictions.get(program.ma_chuong_trinh) ??
                      (aliasPredictions.length === 1
                          ? aliasPredictions[0]
                          : null))
                    : null;
            const reference = benchmark?.diem ?? predictionScore;
            const industry = normalized(program.nganh?.ten_nganh ?? program.ten_chuong_trinh);
            const variantKey = industry.startsWith("ngonnguanh") ? "english" : industry.startsWith("toanungdung") ? "applied_math" : "standard";
            const variant = calculation.variants?.[variantKey];
            const eligibilityStatus = variant?.eligibilityStatus ?? calculation.eligibilityStatus;
            const pendingReason = eligibilityStatus === "pending"
                ? (variant?.preliminaryNotes ?? calculation.preliminaryNotes).join(" ") || "Chưa có điểm thi để kiểm tra điều kiện."
                : null;
            const final = variant ? variant.finalScore : calculation.finalScore;
            const diff =
                reference !== null && final !== null && Number.isFinite(final)
                    ? Number((final - reference).toFixed(2))
                    : null;
            let chance: ComparisonRow["chance"] = "unknown";
            let reason =
                "Chưa có điểm chính thức hoặc ước tính AI cùng năm để đối chiếu.";
            let hardFailure = eligibilityStatus === "not_met" || !(variant ? variant.passPreliminary : calculation.passPreliminary);
            // Điểm THPT tham chiếu không chứng minh PT2/HSA/TSA được mở và đã đủ điều kiện riêng.
            let incomplete = eligibilityStatus === "pending" || calculation.method === "HOC_BA" || calculation.method === "DGNL";
            if (hardFailure)
                reason =
                    (variant?.preliminaryNotes ?? calculation.preliminaryNotes)[0] ??
                    "Chưa đạt điều kiện sơ bộ.";
            else if (final === null)
                reason = "Chưa có cấu hình quy đổi cho điểm đã nhập.";
            else {
                const combinations =
                    (current.program ?? program).ctdt_to_hop?.filter(
                        (item) => item.nam === year,
                    ) ?? [];
                if (calculation.method !== "DGNL" && !combinations.length) incomplete = true;
                else if (calculation.method !== "DGNL" &&
                    !combinations.some(
                        (item) =>
                            item.ma_to_hop === calculation.combinationCode,
                    )
                ) {
                    hardFailure = true;
                    reason =
                        "Tổ hợp không thuộc chương trình trong năm đối chiếu.";
                }
                const conditions = benchmark?.dieu_kien_mon;
                if (!hardFailure && conditions != null) {
                    if (
                        typeof conditions !== "object" ||
                        Array.isArray(conditions)
                    )
                        incomplete = true;
                    else
                        for (const [key, minimum] of Object.entries(
                            conditions,
                        )) {
                            const subject = calculation.subjects.find(
                                (item) =>
                                    normalized(item.code) === normalized(key) ||
                                    normalized(item.name) === normalized(key),
                            );
                            if (
                                typeof minimum !== "number" ||
                                !Number.isFinite(minimum) ||
                                minimum < 0 ||
                                minimum > 10 ||
                                !subject
                            )
                                incomplete = true;
                            else if (subject.score < minimum) {
                                hardFailure = true;
                                reason = `${subject.name}: ${subject.score} < ${minimum}, chưa đạt điều kiện môn.`;
                            }
                        }
                }
                if (!hardFailure && diff !== null) {
                    if (
                        benchmark?.nguyen_vong_toi_da != null ||
                        (benchmark?.diem_uu_tien_toi_thieu != null &&
                            benchmark.diem_uu_tien_toi_thieu !== 0)
                    )
                        incomplete = true;
                    reason = pendingReason ?? (incomplete
                        ? "Chỉ so sánh điểm; chưa xác minh đủ tổ hợp hoặc tiêu chí phụ."
                        : predictionScore !== null && !benchmark
                          ? "Đối chiếu ước tính AI tham khảo, không phải kết luận trúng tuyển."
                          : "Đối chiếu điểm THPT tham khảo, không phải kết luận trúng tuyển.");
                }
            }
            if (!hardFailure && current.conflict) {
                incomplete = true;
                reason =
                    "Các mã lịch sử có điểm cùng năm chưa thống nhất; cần đối chiếu nguồn trước khi so điểm.";
            }
            if (!hardFailure && pendingReason) reason = pendingReason;
            // Ba nhóm thể hiện vị trí điểm; điều kiện nhập học được trình bày riêng.
            const pointBand: PointBand | null =
                diff !== null
                    ? diff >= 0.5
                        ? "high"
                        : diff >= -0.5
                          ? "medium"
                          : "low"
                    : null;
            chance = hardFailure
                ? "ineligible"
                : incomplete || pointBand === null
                  ? "unknown"
                  : pointBand;
            return {
                personalScore: final,
                ma_chuong_trinh: program.ma_chuong_trinh,
                ten_chuong_trinh: program.ten_chuong_trinh,
                ma_nganh: program.ma_nganh,
                ten_nganh: program.nganh?.ten_nganh ?? program.ten_chuong_trinh,
                faculty: program.nganh?.khoi_nganh?.ten_khoi_nganh ?? "",
                benchmarkYear: year,
                benchmarkScore: benchmark?.diem ?? null,
                previousScore: previous?.diem ?? null,
                predictionScore,
                matchedMethodName: "THPT · thang 30",
                diff,
                chance,
                pointBand,
                reason,
                sourceCodes: members
                    .map((member) => member.ma_chuong_trinh)
                    .sort(),
                benchmarkSourceCode: current.program?.ma_chuong_trinh ?? null,
                previousSourceCode: historical.program?.ma_chuong_trinh ?? null,
                previousConflict: historical.conflict,
            };
        })
        .sort((a, b) => {
            // Mã cũ chưa có điểm không che khuất các chương trình đã công bố điểm năm chọn.
            const priority = (row: ComparisonRow) =>
                referenceSource(row) === "official"
                    ? 0
                    : referenceSource(row) === "ai"
                      ? 1
                      : validScore(row.previousScore)
                        ? 2
                        : 3;
            return (
                priority(a) - priority(b) ||
                a.ma_chuong_trinh.localeCompare(b.ma_chuong_trinh, "vi", {
                    numeric: true,
                })
            );
        });
}
