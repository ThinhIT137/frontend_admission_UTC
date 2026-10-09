const { test } = require("node:test");
const assert = require("node:assert/strict");
const { fixture, quietErrors } = require("./helpers.cjs");
// Chỉ thiết lập đầu mùa theo chương trình/năm, không cập nhật điểm cuối mùa.
const input = {
    ma_chuong_trinh: "P1",
    nam: 2026,
    chi_tieu: 100,
    phuong_thuc_ids: ["PT1", "PT2"],
};
test("thiết lập chỉ tiêu đầu mùa và khởi tạo điểm phương thức bằng 0", async () => {
    const f = fixture();
    assert.deepEqual(
        await f.load("actions/chi_tieu.action.ts").createChiTieuAction(input),
        { id: "result" },
    );
    // Trùng chỉ tiêu được kiểm tra bằng khóa ghép chương trình/năm.
    assert.deepEqual(f.db.lichSuDiemChuan.findUnique.mock.calls[0].arguments, [
        {
            where: {
                ma_chuong_trinh_nam: { ma_chuong_trinh: "P1", nam: 2026 },
            },
        },
    ]);
    // Nested create: lưu admin thực hiện và khởi tạo điểm 0 cho từng phương thức.
    // Kiểm tra query gửi Prisma, không xác nhận constraint/transaction DB thật.
    assert.deepEqual(f.db.lichSuDiemChuan.create.mock.calls[0].arguments, [
        {
            data: {
                ma_chuong_trinh: "P1",
                nam: 2026,
                chi_tieu: 100,
                ma_admin_cap_nhat: "actor",
                diem_trung_tuyen: {
                    create: [
                        { ma_phuong_thuc: "PT1", diem: 0 },
                        { ma_phuong_thuc: "PT2", diem: 0 },
                    ],
                },
            },
        },
    ]);
    assert.deepEqual(f.revalidatePath.mock.calls[0].arguments, [
        "/admin/chi-tieu-diem-chuan",
    ]);
});
test("không tạo lại chỉ tiêu cùng chương trình/năm", async () =>
    quietErrors(async () => {
        const f = fixture();
        f.db.lichSuDiemChuan.findUnique.mock.mockImplementation(
            async () => ({}),
        );
        await assert.rejects(
            f.load("actions/chi_tieu.action.ts").createChiTieuAction(input),
            /đã có chỉ tiêu trong năm 2026/,
        );
        assert.equal(f.db.lichSuDiemChuan.create.mock.callCount(), 0);
        assert.equal(f.revalidatePath.mock.callCount(), 0);
    }));
test("thiết lập chỉ tiêu yêu cầu session", async () =>
    quietErrors(async () => {
        const f = fixture(false);
        await assert.rejects(
            f.load("actions/chi_tieu.action.ts").createChiTieuAction(input),
            /quyền truy cập/,
        );
        assert.equal(f.db.lichSuDiemChuan.findUnique.mock.callCount(), 0);
        assert.equal(f.db.lichSuDiemChuan.create.mock.callCount(), 0);
    }));
test("lỗi khóa ngoại/DB khi thiết lập chỉ tiêu được trả lên action", async () =>
    quietErrors(async () => {
        const f = fixture();
        f.db.lichSuDiemChuan.create.mock.mockImplementation(async () => {
            throw new Error("Foreign key violation");
        });
        await assert.rejects(
            f.load("actions/chi_tieu.action.ts").createChiTieuAction(input),
            /Foreign key violation/,
        );
        assert.equal(f.revalidatePath.mock.callCount(), 0);
    }));
// Có năm thì lọc; không truyền năm thì lấy mọi năm.
for (const year of [2026, undefined]) {
    test(`đọc chỉ tiêu: ${year || "mọi năm"}`, async () => {
        const f = fixture();
        assert.deepEqual(
            await f.load("actions/chi_tieu.action.ts").getChiTieuAction(year),
            [],
        );
        assert.deepEqual(
            f.db.lichSuDiemChuan.findMany.mock.calls[0].arguments[0].where,
            year ? { nam: year } : {},
        );
    });
}
// Đổi từng trường để cô lập lỗi; input sai không được tới bước ghi DB.
for (const [label, change] of [
    ["âm", { chi_tieu: -1 }],
    ["bằng 0", { chi_tieu: 0 }],
    ["số lẻ", { chi_tieu: 1.5 }],
    ["không chọn phương thức", { phuong_thuc_ids: [] }],
    ["thiếu chương trình", { ma_chuong_trinh: "" }],
]) {
    test(`server từ chối chỉ tiêu ${label}`, async () =>
        quietErrors(async () => {
            const f = fixture();
            await assert.rejects(
                f
                    .load("actions/chi_tieu.action.ts")
                    .createChiTieuAction({ ...input, ...change }),
            );
            assert.equal(f.db.lichSuDiemChuan.create.mock.callCount(), 0);
        }));
}
