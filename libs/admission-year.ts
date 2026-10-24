// Ưu tiên đề án năm hiện tại; nếu chưa có thì năm sắp tới gần nhất, rồi năm cũ gần nhất.
export function admissionYear(years: number[], currentYear: number): number {
  const available = [...new Set(years.filter(year => Number.isInteger(year) && year > 0))];
  if (available.includes(currentYear)) return currentYear;
  return available.filter(year => year > currentYear).sort((a, b) => a - b)[0]
    ?? available.filter(year => year < currentYear).sort((a, b) => b - a)[0] ?? currentYear;
}
