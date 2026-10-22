const { test } = require("node:test");
const assert = require("node:assert/strict");
const { fixture } = require("./helpers.cjs");
const definitions = [
    {
        file: "nganh_hoc",
        name: "nganhHocService",
        model: "nganhHoc",
        id: "ma_nganh",
        data: {
            ma_nganh: "M1",
            ten_nganh: "CNTT",
            ma_khoi_nganh: "F1",
            khoi_kien_thuc: "K",
            ma_admin_quan_ly: "actor",
        },
    },
    {
        file: "chuong_trinh_dao_tao",
        name: "chuongTrinhDaoTaoService",
        model: "chuongTrinhDaoTao",
        id: "ma_chuong_trinh",
        data: {
            ma_chuong_trinh: "P1",
            ma_nganh: "M1",
            ten_chuong_trinh: "CNTT",
            ma_admin_quan_ly: "actor",
        },
    },
];
for (const d of definitions) {
    for (const operation of ["create", "update", "delete"]) {
        for (const valid of [true, false]) {
            test(`${d.model} ${operation}: ${valid ? "valid admin" : "nonexistent admin"}`, async () => {
                const f = fixture();
                f.db.admin.findUnique.mock.mockImplementation(async () =>
                    valid ? { ma_admin: "actor" } : null,
                );
                f.db.nganhHoc.findUnique.mock.mockImplementation(async () => ({
                    ma_nganh: "M1",
                }));
                const service = f.load(`services/${d.file}.service.ts`)[d.name];
                const args =
                    operation === "create"
                        ? [d.data]
                        : operation === "update"
                          ? [d.data[d.id], d.data]
                          : [d.data[d.id], "actor"];
                if (valid) {
                    await service[operation](...args);
                    const query =
                        f.db[d.model][operation].mock.calls[0].arguments[0];
                    if (operation !== "create")
                        assert.deepEqual(query.where, { [d.id]: d.data[d.id] });
                    if (operation !== "delete")
                        assert.equal(query.data.ma_admin_quan_ly, "actor");
                    if (
                        d.model === "chuongTrinhDaoTao" &&
                        operation === "create"
                    )
                        assert.deepEqual(query.data.chuan_dau_ra, []);
                } else {
                    await assert.rejects(
                        service[operation](...args),
                        /admin không tồn tại/,
                    );
                    assert.equal(f.db[d.model][operation].mock.callCount(), 0);
                }
                assert.equal(f.db.$transaction.mock.callCount(), 1);
            });
        }
        test(`${d.model} ${operation} propagates database failure`, async () => {
            const f = fixture();
            f.db.admin.findUnique.mock.mockImplementation(
                async () => ({}),
            );
            f.db.nganhHoc.findUnique.mock.mockImplementation(async () => ({}));
            f.db[d.model][operation].mock.mockImplementation(async () => {
                throw new Error("DB constraint");
            });
            const service = f.load(`services/${d.file}.service.ts`)[d.name];
            const args =
                operation === "create"
                    ? [d.data]
                    : operation === "update"
                      ? [d.data[d.id], d.data]
                      : [d.data[d.id], "actor"];
            await assert.rejects(service[operation](...args), /DB constraint/);
        });
    }
}
for (const operation of ["create", "update"]) {
    test(`program ${operation} rejects nonexistent major`, async () => {
        const f = fixture();
        f.db.admin.findUnique.mock.mockImplementation(async () => ({}));
        f.db.nganhHoc.findUnique.mock.mockImplementation(async () => null);
        const service = f.load(
            "services/chuong_trinh_dao_tao.service.ts",
        ).chuongTrinhDaoTaoService;
        const data = definitions[1].data;
        await assert.rejects(
            service[operation](
                ...(operation === "create" ? [data] : ["P1", data]),
            ),
            /Ngành học không tồn tại/,
        );
        assert.equal(f.db.chuongTrinhDaoTao[operation].mock.callCount(), 0);
    });
}
test("program update persists short description (regression)", async () => {
    const f = fixture();
    f.db.admin.findUnique.mock.mockImplementation(async () => ({}));
    await f
        .load("services/chuong_trinh_dao_tao.service.ts")
        .chuongTrinhDaoTaoService.update("P1", {
            ma_admin_quan_ly: "actor",
            mo_ta_ngan: "New description",
        });
    assert.equal(
        f.db.chuongTrinhDaoTao.update.mock.calls[0].arguments[0].data
            .mo_ta_ngan,
        "New description",
    );
});
for (const description of [null, "", undefined]) {
    test(`program update passes ${String(description)} description without coercion`, async () => {
        const f = fixture();
        f.db.admin.findUnique.mock.mockImplementation(async () => ({}));
        await f
            .load("services/chuong_trinh_dao_tao.service.ts")
            .chuongTrinhDaoTaoService.update("P1", {
                ma_admin_quan_ly: "actor",
                mo_ta_ngan: description,
            });
        assert.equal(
            f.db.chuongTrinhDaoTao.update.mock.calls[0].arguments[0].data
                .mo_ta_ngan,
            description,
        );
    });
}
test("program update action passes short description through to persistence", async () => {
    const f = fixture();
    f.db.admin.findUnique.mock.mockImplementation(async () => ({ vai_tro: { ten_vai_tro: "chuyen_vien" } }));
    f.cookies.getCookie.mock.mockImplementation(async () => "access");
    await f
        .load("actions/chuong_trinh_dao_tao.action.ts")
        .updateCTDTAction(
            "P1",
            undefined,
            undefined,
            undefined,
            undefined,
            "New description",
        );
    assert.equal(
        f.db.chuongTrinhDaoTao.update.mock.calls[0].arguments[0].data
            .mo_ta_ngan,
        "New description",
    );
    assert.deepEqual(f.revalidatePath.mock.calls[0].arguments, [
        "/admin/quan-ly-ctdt",
    ]);
});
test("program read paginates and sorts", async () => {
    const f = fixture();
    const rows = [{ ma_chuong_trinh: "P1" }];
    f.db.chuongTrinhDaoTao.findMany.mock.mockImplementation(async () => rows);
    assert.deepEqual(
        await f
            .load("services/chuong_trinh_dao_tao.service.ts")
            .chuongTrinhDaoTaoService.get({ page: 2, pageSize: 10 }),
        rows,
    );
    assert.deepEqual(
        f.db.chuongTrinhDaoTao.findMany.mock.calls[0].arguments[0],
        { skip: 10, take: 10, orderBy: { create_at: "desc" } },
    );
});
test("major read returns list including empty data", async () => {
    const f = fixture();
    f.db.nganhHoc.findMany.mock.mockImplementation(async () => []);
    assert.deepEqual(
        await f.load("services/nganh_hoc.service.ts").nganhHocService.get({}),
        [],
    );
});
const actions = [
    [
        "admin_account",
        "createAdminAction",
        ["Name", "e@example.com", "secret", "role"],
        "admin",
        "create",
        "/admin/accounts",
    ],
    [
        "admin_account",
        "updateAdminAction",
        ["other", "Name"],
        "admin",
        "update",
        "/admin/accounts",
    ],
    [
        "admin_account",
        "deleteAdminAction",
        ["other"],
        "admin",
        "delete",
        "/admin/accounts",
    ],
    [
        "role",
        "createRoleAction",
        ["Custom"],
        "vaiTro",
        "create",
        "/admin/roles",
    ],
    [
        "role",
        "updateRoleAction",
        ["role", "New"],
        "vaiTro",
        "update",
        "/admin/roles",
    ],
    ["role", "deleteRoleAction", ["role"], "vaiTro", "delete", "/admin/roles"],
    [
        "nganh_hoc",
        "createNganhHoc",
        ["M1", "CNTT", "F1", "K"],
        "nganhHoc",
        "create",
        "/admin/quan-ly-nganh-hoc",
    ],
    [
        "nganh_hoc",
        "updateNganhHoc",
        ["M1", "M2", "New"],
        "nganhHoc",
        "update",
        "/admin/quan-ly-nganh-hoc",
    ],
    [
        "nganh_hoc",
        "deleteNganhHoc",
        ["M1"],
        "nganhHoc",
        "delete",
        "/admin/quan-ly-nganh-hoc",
    ],
    [
        "chuong_trinh_dao_tao",
        "createCTDTAction",
        ["P1", "M1", "CNTT"],
        "chuongTrinhDaoTao",
        "create",
        "/admin/quan-ly-ctdt",
    ],
    [
        "chuong_trinh_dao_tao",
        "updateCTDTAction",
        ["P1", "M1", "New"],
        "chuongTrinhDaoTao",
        "update",
        "/admin/quan-ly-ctdt",
    ],
    [
        "chuong_trinh_dao_tao",
        "deleteCTDTAction",
        ["P1"],
        "chuongTrinhDaoTao",
        "delete",
        "/admin/quan-ly-ctdt",
    ],
];
for (const [file, name, args, model, operation, route] of actions) {
    for (const scenario of ["success", "no session", "database error"]) {
        test(`${name}: ${scenario}`, async () => {
            const f = fixture();
            f.cookies.getCookie.mock.mockImplementation(async () =>
                scenario === "no session" ? undefined : "access",
            );
            f.db.admin.findUnique.mock.mockImplementation(
                async () => ({}),
            );
            f.db.admin.findUnique.mock.mockImplementation(async ({ where }) =>
                where.ma_admin
                    ? { vai_tro: { ten_vai_tro: "super_admin" } }
                    : null,
            );
            f.db.nganhHoc.findUnique.mock.mockImplementation(async () => ({}));
            f.db.vaiTro.findUnique.mock.mockImplementation(async ({ where }) =>
                where.ma_vai_tro
                    ? { ten_vai_tro: "custom", _count: { admins: 0 } }
                    : null,
            );
            if (scenario === "database error")
                f.db[model][operation].mock.mockImplementation(async () => {
                    throw new Error("DB failure");
                });
            const action = f.load(`actions/${file}.action.ts`)[name];
            if (scenario === "success") {
                await action(...args);
                assert.equal(f.db[model][operation].mock.callCount(), 1);
                assert.ok(
                    f.revalidatePath.mock.calls.some(
                        (c) => c.arguments[0] === route,
                    ),
                );
            } else {
                await assert.rejects(action(...args));
                assert.equal(f.revalidatePath.mock.callCount(), 0);
                if (scenario === "no session")
                    assert.equal(f.db[model][operation].mock.callCount(), 0);
            }
        });
    }
}
