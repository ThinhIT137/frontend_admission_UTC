/** Parse the whole decimal input; never accept expressions or numeric prefixes. */
export function parseScoreInput(raw: string, max: number, step?: number): number | null {
  const value = raw.trim();
  if (!/^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(value)) return null;
  const score = Number(value.replace(",", "."));
  if (!Number.isFinite(score) || score < 0 || score > max) return null;
  if (step && Math.abs(score / step - Math.round(score / step)) > 1e-8) return null;
  return score;
}

export function scoreInputError(raw: string, max: number, step?: number, required = false): string {
  if (!raw.trim()) return required ? "Vui lòng nhập điểm." : "";
  if (parseScoreInput(raw, max, step) !== null) return "";
  if (step === 0.5) return `Điểm phải từ 0 đến ${max}, theo bước 0,5.`;
  return `Nhập một số từ 0 đến ${max}; không nhập dấu phép tính.`;
}
