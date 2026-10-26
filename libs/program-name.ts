/** Giữ nguyên chuyên ngành/ngôn ngữ; chỉ chuẩn hóa cách viết cùng tên CTĐT. */
export function programNameKey(name: string) {
  return name.normalize("NFC").toLocaleLowerCase("vi")
    .replace(/chương trình chất lượng cao/g, "chương trình clc")
    .replace(/[‐‑–—]/g, "-").replace(/\s*([(),:-])\s*/g, "$1")
    .replace(/\s+/g, " ").trim();
}
