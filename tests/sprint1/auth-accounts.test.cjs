const { test } = require("node:test");
const assert = require("node:assert/strict");
const { fixture } = require("./helpers.cjs");
const user = {
    ma_admin: "actor",
    mat_khau: "stored",
    vai_tro: { ten_vai_tro: "super_admin" },
};
const input = { email: "admin@example.com", password: "secret" };
test("login issues both cookies only after password verification", async () => {
    const f = fixture();
    f.db.admin.findUnique.mock.mockImplementation(async () => user);
    await f.load("actions/auth.action.ts").login(input);
    assert.deepEqual(f.password.verifyPassword.mock.calls[0].arguments, [
        "secret",
        "stored",
    ]);
    assert.deepEqual(f.tokens.generateToken.mock.calls[0].arguments, ["actor"]);
    const args = f.cookies.setToken.mock.calls[0].arguments;
    assert.deepEqual(
        args.map((a) => a.slice(0, 2)),
        [
            ["accessToken", "access"],
            ["refreshToken", "refresh"],
        ],
    );
    assert.ok(args.every((a) => a[2] > 0));
});
for (const scenario of [
    "unknown email",
    "wrong password",
    "missing credentials",
    "database failure",
]) {
    test(`login rejects ${scenario} without issuing tokens`, async () => {
        const f = fixture();
        f.db.admin.findUnique.mock.mockImplementation(async () => {
            if (scenario === "database failure")
                throw new Error("DB unavailable");
            return scenario === "wrong password" ? user : null;
        });
        f.password.verifyPassword.mock.mockImplementation(async () => false);
        await assert.rejects(
            f.admin.login(scenario === "missing credentials" ? {} : input),
        );
        assert.equal(f.tokens.generateToken.mock.callCount(), 0);
        assert.equal(f.cookies.setToken.mock.callCount(), 0);
    });
}
test("logout removes both cookies", async () => {
    const f = fixture();
    await f.load("actions/auth.action.ts").logout();
    assert.deepEqual(
        f.cookies.deleteCookie.mock.calls.map((c) => c.arguments[0]),
        ["accessToken", "refreshToken"],
    );
});
for (const scenario of ["missing", "invalid", "deleted account", "valid"]) {
    test(`refresh token: ${scenario}`, async () => {
        const f = fixture();
        f.cookies.getCookie.mock.mockImplementation(async () =>
            scenario === "missing" ? undefined : "refresh",
        );
        f.tokens.verifyRefreshToken.mock.mockImplementation(async () =>
            scenario === "invalid" ? null : { userId: "actor" },
        );
        f.db.admin.findUnique.mock.mockImplementation(async () =>
            scenario === "deleted account" ? null : user,
        );
        if (scenario === "valid") {
            await f.admin.refreshAccessToken();
            assert.equal(f.cookies.setToken.mock.callCount(), 1);
        } else {
            await assert.rejects(f.admin.refreshAccessToken());
            assert.equal(f.cookies.setToken.mock.callCount(), 0);
            assert.equal(
                f.cookies.deleteCookie.mock.callCount(),
                scenario === "missing" ? 0 : 2,
            );
        }
    });
}
for (const scenario of ["missing", "invalid", "valid"]) {
    test(`getAdminId: ${scenario}`, async () => {
        const f = fixture();
          f.db.admin.findUnique.mock.mockImplementation(async () => ({ vai_tro: { ten_vai_tro: "chuyen_vien" } }));
        f.cookies.getCookie.mock.mockImplementation(async () =>
            scenario === "missing" ? undefined : "access",
        );
        f.tokens.verifyAccessToken.mock.mockImplementation(async () =>
            scenario === "invalid" ? null : { userId: "actor" },
        );
        if (scenario === "valid")
            assert.equal(await f.admin.getAdminId(), "actor");
        else await assert.rejects(f.admin.getAdminId());
    });
}
for (const operation of ["create", "update", "delete"]) {
    test(`ordinary admin cannot ${operation} another account`, async () => {
        const f = fixture();
        f.db.admin.findUnique.mock.mockImplementation(async () => ({
            vai_tro: { ten_vai_tro: "chuyen_vien" },
        }));
        const args =
            operation === "create"
                ? [{ email: "new@example.com" }, "actor"]
                : operation === "update"
                  ? ["other", {}, "actor"]
                  : ["other", "actor"];
        await assert.rejects(f.admin[operation](...args), /Super Admin/);
        assert.equal(f.db.admin[operation].mock.callCount(), 0);
    });
}
test("super admin creates account with hashed password", async () => {
    const f = fixture();
    f.db.admin.findUnique.mock.mockImplementation(async ({ where }) =>
        where.ma_admin ? user : null,
    );
    await f.admin.create(
        {
            ho_ten: "Admin",
            email: "new@example.com",
            mat_khau: "secret",
            ma_vai_tro: "role",
        },
        "actor",
    );
    assert.equal(
        f.db.admin.create.mock.calls[0].arguments[0].data.mat_khau,
        "hashed",
    );
});
test("duplicate account email rejected before password hashing", async () => {
    const f = fixture();
    f.db.admin.findUnique.mock.mockImplementation(async () => user);
    await assert.rejects(
        f.admin.create({ email: "used@example.com" }, "actor"),
        /Email đã tồn tại/,
    );
    assert.equal(f.password.hashPassword.mock.callCount(), 0);
});
test("self profile update preserves password when omitted", async () => {
    const f = fixture();
    await f.admin.update("actor", { ho_ten: "Updated", mat_khau: "" }, "actor");
    assert.deepEqual(f.db.admin.update.mock.calls[0].arguments[0], {
        where: { ma_admin: "actor" },
        data: { ho_ten: "Updated" },
    });
});
test("ordinary admin must not promote own role (security regression)", async () => {
    const f = fixture();
    f.db.admin.findUnique.mock.mockImplementation(async () => ({
        vai_tro: { ten_vai_tro: "chuyen_vien" },
    }));
    await assert.rejects(
        f.admin.update("actor", { ma_vai_tro: "super-role" }, "actor"),
        /Chỉ Super Admin mới có quyền thay đổi vai trò/,
    );
    assert.equal(f.db.admin.update.mock.callCount(), 0);
});
test("Server Action rejects ordinary admin changing own role without invalidating cache", async () => {
    const f = fixture();
    f.cookies.getCookie.mock.mockImplementation(async () => "access");
    f.db.admin.findUnique.mock.mockImplementation(async () => ({
        vai_tro: { ten_vai_tro: "chuyen_vien" },
    }));
    await assert.rejects(
        f
            .load("actions/admin_account.action.ts")
            .updateAdminAction(
                "actor",
                undefined,
                undefined,
                undefined,
                "super-role",
            ),
        /Chỉ Super Admin/,
    );
    assert.equal(f.db.admin.update.mock.callCount(), 0);
    assert.equal(f.revalidatePath.mock.callCount(), 0);
});
for (const target of ["actor", "other"]) {
    test(`super admin can assign role to ${target}`, async () => {
        const f = fixture();
        f.db.admin.findUnique.mock.mockImplementation(async () => user);
        await f.admin.update(target, { ma_vai_tro: "new-role" }, "actor");
        assert.deepEqual(f.db.admin.update.mock.calls[0].arguments[0], {
            where: { ma_admin: target },
            data: { ma_vai_tro: "new-role" },
        });
    });
}
test("super admin cannot delete self", async () => {
    const f = fixture();
    f.db.admin.findUnique.mock.mockImplementation(async () => user);
    await assert.rejects(f.admin.delete("actor", "actor"), /Không thể tự xóa/);
    assert.equal(f.db.admin.delete.mock.callCount(), 0);
});
for (const operation of ["create", "update", "delete"]) {
    test(`role ${operation} requires super admin`, async () => {
        const f = fixture();
        const role = f.load("services/role.service.ts").roleService;
        const args =
            operation === "create"
                ? [{ ten_vai_tro: "custom" }, "actor"]
                : operation === "update"
                  ? ["role", {}, "actor"]
                  : ["role", "actor"];
        await assert.rejects(role[operation](...args), /Super Admin/);
        assert.equal(f.db.vaiTro[operation].mock.callCount(), 0);
    });
}
for (const scenario of [
    "super_admin",
    "chuyen_vien",
    "in use",
    "missing",
    "unused",
]) {
    test(`delete role: ${scenario}`, async () => {
        const f = fixture();
        f.db.admin.findUnique.mock.mockImplementation(async () => user);
        f.db.vaiTro.findUnique.mock.mockImplementation(async () =>
            scenario === "missing"
                ? null
                : {
                      ten_vai_tro: scenario,
                      _count: { admins: scenario === "in use" ? 1 : 0 },
                  },
        );
        const role = f.load("services/role.service.ts").roleService;
        if (scenario === "unused") {
            await role.delete("role", "actor");
            assert.equal(f.db.vaiTro.delete.mock.callCount(), 1);
        } else {
            await assert.rejects(role.delete("role", "actor"));
            assert.equal(f.db.vaiTro.delete.mock.callCount(), 0);
        }
    });
}
