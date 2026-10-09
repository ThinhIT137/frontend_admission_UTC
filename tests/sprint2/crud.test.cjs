const { test } = require("node:test");
const assert = require("node:assert/strict");
const { fixture, quietErrors } = require("./helpers.cjs");

// Ngày UTC cố định giúp case CRUD không phụ thuộc ngày chạy hoặc múi giờ máy.
const milestone = {
    ten_su_kien: "Mở đăng ký",
    thoi_gian_bat_dau: new Date("2026-03-01T00:00:00Z"),
    thoi_gian_ket_thuc: new Date("2026-03-10T00:00:00Z"),
    ghi_chu: "Đợt 1",
};
// Khi sửa, dữ liệu sai phải bị chặn trước khi ghi DB và invalidate cache.
for (const [file, model, action, args] of [
    [
        "to_hop_xet_tuyen",
        "toHopXetTuyen",
        "updateToHopAction",
        ["A00", "M1", "M1", "M3"],
    ],
    [
        "phuong_thuc_xet_tuyen",
        "phuongThucXetTuyen",
        "updatePhuongThucXetTuyenAction",
        ["PT1", { ten_phuong_thuc: "   " }],
    ],
    [
        "lo_trinh_tuyen_sinh",
        "loTrinhTuyenSinh",
        "updateLoTrinhTuyenSinhAction",
        ["E1", { ten_su_kien: "   " }],
    ],
]) {
    test(`${action}: validation cũng áp dụng khi cập nhật`, async () =>
        quietErrors(async () => {
            const f = fixture();
            await assert.rejects(
                f.load(`actions/${file}.action.ts`)[action](...args),
            );
            assert.equal(f.db[model].update.mock.callCount(), 0);
            assert.equal(f.revalidatePath.mock.callCount(), 0);
        }));
}
// Mỗi case gọi action/service thật và kiểm tra query gửi tới Prisma mock.
// Mỗi dòng: file, model, action, thao tác, input, query mong đợi, route cache.
// Dùng action/service thật; chỉ Prisma và session là mock, không ghi DB thật.
const cases = [
    [
        "to_hop_xet_tuyen",
        "toHopXetTuyen",
        "createToHopAction",
        "create",
        ["A00", "M1", "M2", "M3"],
        {
            data: {
                ma_to_hop: "A00",
                ma_mon_1: "M1",
                ma_mon_2: "M2",
                ma_mon_3: "M3",
            },
        },
        "/admin/to-hop-mon",
    ],
    [
        "to_hop_xet_tuyen",
        "toHopXetTuyen",
        "updateToHopAction",
        "update",
        ["A00", "M4", "M2", "M3"],
        {
            where: { ma_to_hop: "A00" },
            data: { ma_mon_1: "M4", ma_mon_2: "M2", ma_mon_3: "M3" },
        },
        "/admin/to-hop-mon",
    ],
    [
        "to_hop_xet_tuyen",
        "toHopXetTuyen",
        "deleteToHopAction",
        "delete",
        ["A00"],
        { where: { ma_to_hop: "A00" } },
        "/admin/to-hop-mon",
    ],
    [
        "phuong_thuc_xet_tuyen",
        "phuongThucXetTuyen",
        "createPhuongThucXetTuyenAction",
        "create",
        [{ ma_phuong_thuc: "PT1", ten_phuong_thuc: "Thi THPT" }],
        { data: { ma_phuong_thuc: "PT1", ten_phuong_thuc: "Thi THPT" } },
        "/admin/phuong-thuc-xet-tuyen",
    ],
    [
        "phuong_thuc_xet_tuyen",
        "phuongThucXetTuyen",
        "updatePhuongThucXetTuyenAction",
        "update",
        ["PT1", { ten_phuong_thuc: "Mới" }],
        { where: { ma_phuong_thuc: "PT1" }, data: { ten_phuong_thuc: "Mới" } },
        "/admin/phuong-thuc-xet-tuyen",
    ],
    [
        "phuong_thuc_xet_tuyen",
        "phuongThucXetTuyen",
        "deletePhuongThucXetTuyenAction",
        "delete",
        ["PT1"],
        { where: { ma_phuong_thuc: "PT1" } },
        "/admin/phuong-thuc-xet-tuyen",
    ],
    [
        "lo_trinh_tuyen_sinh",
        "loTrinhTuyenSinh",
        "createLoTrinhTuyenSinhAction",
        "create",
        [milestone],
        { data: { ...milestone, ma_admin_cap_nhat: "actor" } },
        "/admin/moc-thoi-gian",
    ],
    [
        "lo_trinh_tuyen_sinh",
        "loTrinhTuyenSinh",
        "updateLoTrinhTuyenSinhAction",
        "update",
        ["E1", { ghi_chu: "Mới" }],
        {
            where: { ma_su_kien: "E1" },
            data: { ghi_chu: "Mới", ma_admin_cap_nhat: "actor" },
        },
        "/admin/moc-thoi-gian",
    ],
    [
        "lo_trinh_tuyen_sinh",
        "loTrinhTuyenSinh",
        "deleteLoTrinhTuyenSinhAction",
        "delete",
        ["E1"],
        { where: { ma_su_kien: "E1" } },
        "/admin/moc-thoi-gian",
    ],
];
for (const [file, model, action, operation, args, query, route] of cases) {
    test(`${action}: dữ liệu hợp lệ và cache invalidation`, async () => {
        const f = fixture();
        const result = await f
            .load(`actions/${file}.action.ts`)
            [action](...args);
        assert.deepEqual(f.db[model][operation].mock.calls[0].arguments, [
            query,
        ]);
        assert.deepEqual(
            f.revalidatePath.mock.calls.map((c) => c.arguments),
            [[route]],
        );
        if (file !== "to_hop_xet_tuyen")
            assert.deepEqual(
                result,
                operation === "delete" ? true : { id: "result" },
            );
    });
    test(`${action}: từ chối người chưa đăng nhập`, async () =>
        quietErrors(async () => {
            const f = fixture(false);
            await assert.rejects(
                f.load(`actions/${file}.action.ts`)[action](...args),
            );
            assert.equal(f.db[model][operation].mock.callCount(), 0);
            assert.equal(f.revalidatePath.mock.callCount(), 0);
        }));
    test(`${action}: lỗi DB không invalidate cache`, async () =>
        quietErrors(async () => {
            const f = fixture();
            f.db[model][operation].mock.mockImplementation(async () => {
                throw new Error("DB constraint");
            });
            await assert.rejects(
                f.load(`actions/${file}.action.ts`)[action](...args),
                /DB constraint/,
            );
            assert.equal(f.revalidatePath.mock.callCount(), 0);
        }));
}
// Read kiểm tra cả danh sách rỗng/có dữ liệu, sắp xếp và quan hệ cần hiển thị.
const reads = [
    [
        "to_hop_xet_tuyen",
        "getAllToHopAction",
        "toHopXetTuyen",
        {
            include: {
                mon_1: true,
                mon_2: true,
                mon_3: true,
                _count: { select: { ctdt_to_hop: true } },
            },
            orderBy: { ma_to_hop: "asc" },
        },
    ],
    [
        "phuong_thuc_xet_tuyen",
        "getPhuongThucXetTuyenAction",
        "phuongThucXetTuyen",
        { orderBy: { ma_phuong_thuc: "asc" } },
    ],
    [
        "lo_trinh_tuyen_sinh",
        "getLoTrinhTuyenSinhAction",
        "loTrinhTuyenSinh",
        {
            orderBy: { thoi_gian_bat_dau: "asc" },
            include: { admin: { select: { ho_ten: true } } },
        },
    ],
];
for (const [file, action, model, query] of reads) {
    for (const rows of [[], [{ id: "one" }]]) {
        test(`${action}: đọc danh sách ${rows.length} bản ghi`, async () => {
            const f = fixture();
            f.db[model].findMany.mock.mockImplementation(async () => rows);
            assert.deepEqual(
                await f.load(`actions/${file}.action.ts`)[action](),
                rows,
            );
            assert.deepEqual(f.db[model].findMany.mock.calls[0].arguments, [
                query,
            ]);
        });
    }
}
test("tạo phương thức trùng mã bị từ chối trước khi ghi DB", async () =>
    quietErrors(async () => {
        const f = fixture();
        f.db.phuongThucXetTuyen.findUnique.mock.mockImplementation(
            async () => ({ ma_phuong_thuc: "PT1" }),
        );
        await assert.rejects(
            f
                .load("actions/phuong_thuc_xet_tuyen.action.ts")
                .createPhuongThucXetTuyenAction({
                    ma_phuong_thuc: "PT1",
                    ten_phuong_thuc: "Trùng",
                }),
            /Mã phương thức đã tồn tại/,
        );
        assert.equal(f.db.phuongThucXetTuyen.create.mock.callCount(), 0);
        assert.equal(f.revalidatePath.mock.callCount(), 0);
    }));
for (const subjects of [
    ["M1", "M1", "M3"],
    ["", "M2", "M3"],
]) {
    test(`server từ chối tổ hợp ${subjects[0] ? "trùng môn" : "thiếu môn"}`, async () => {
        const f = fixture();
        await assert.rejects(
            f
                .load("actions/to_hop_xet_tuyen.action.ts")
                .createToHopAction("A00", ...subjects),
        );
        assert.equal(f.db.toHopXetTuyen.create.mock.callCount(), 0);
    });
}
test("server từ chối phương thức thiếu tên", async () =>
    quietErrors(async () => {
        const f = fixture();
        await assert.rejects(
            f
                .load("actions/phuong_thuc_xet_tuyen.action.ts")
                .createPhuongThucXetTuyenAction({
                    ma_phuong_thuc: "PT1",
                    ten_phuong_thuc: "",
                }),
        );
        assert.equal(f.db.phuongThucXetTuyen.create.mock.callCount(), 0);
    }));
test("server từ chối mốc thời gian thiếu tên sự kiện", async () =>
    quietErrors(async () => {
        const f = fixture();
        await assert.rejects(
            f
                .load("actions/lo_trinh_tuyen_sinh.action.ts")
                .createLoTrinhTuyenSinhAction({
                    ...milestone,
                    ten_su_kien: "",
                }),
        );
        assert.equal(f.db.loTrinhTuyenSinh.create.mock.callCount(), 0);
    }));
