const { mock } = require('node:test');
const { loader } = require('../sprint1/helpers.cjs');

// Tái sử dụng loader; mỗi test có DB/session riêng, không truy cập DB thật.
function fixture(authenticated = true) {
  // Mặc định: danh sách rỗng, không có bản ghi trùng, thao tác ghi trả bản ghi giả.
  const model = () => Object.fromEntries(['findMany', 'findUnique', 'create', 'update', 'delete']
    .map(name => [name, mock.fn(async () => name === 'findMany' ? [] : name === 'findUnique' ? null : { id: 'result' })]));
  const db = Object.fromEntries(['toHopXetTuyen', 'phuongThucXetTuyen', 'loTrinhTuyenSinh', 'lichSuDiemChuan']
    .map(name => [name, model()]));
  // false mô phỏng session bị từ chối; JWT được kiểm tra riêng ở Sprint 1.
  const getAdminId = mock.fn(async () => {
    if (!authenticated) throw new Error('Bạn không có quyền truy cập');
    return 'actor';
  });
  // Theo dõi invalidation mà không cần cache runtime của Next.js.
  const revalidatePath = mock.fn();
  const load = loader({
    '@/libs/prisma': { __esModule: true, default: db, prismaPublic: db },
    './user.service': { adminService: { getAdminId } },
    '@/services/user.service': { adminService: { getAdminId } },
    'next/cache': { revalidatePath },
  });
  return { db, getAdminId, revalidatePath, load };
}
// Service hiện console.error khi bắt lỗi; giữ log trong mock để kết quả test dễ đọc.
async function quietErrors(run) {
  // Luôn khôi phục console.error, kể cả khi assertion thất bại.
  const spy = mock.method(console, 'error', () => {});
  try { return await run(); } finally { spy.mock.restore(); }
}
module.exports = { fixture, quietErrors };
