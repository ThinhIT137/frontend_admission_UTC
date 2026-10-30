const { test, mock } = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { loader } = require("./helpers.cjs");
const marker = (name) => () =>
    React.createElement("div", { "data-testid": name }, name);
const redirect = (url) => {
    throw new Error(`REDIRECT:${url}`);
};
function pageFixture(user) {
    const get = mock.fn(async () => ({ data: [], totalPages: 0, page: 1 }));
    const load = loader({
        "@/services/user.service": {
            adminService: { getCurrentUser: async () => user, get },
        },
        "@/services/role.service": { roleService: { get } },
        "@/libs/prisma": {
            __esModule: true,
            default: { vaiTro: { findMany: async () => [] } },
        },
        "next/navigation": { redirect, usePathname: () => "/admin" },
        "@/components/admin/AdminSidebar": {
            AdminSidebar: marker("admin-sidebar"),
        },
        "@/components/admin/AdminHeader": {
            AdminHeader: marker("admin-header"),
        },
        "./AdminSidebar": { AdminSidebar: marker("admin-sidebar") },
        "./AdminHeader": { AdminHeader: marker("admin-header") },
        "./AccountList": { AccountList: marker("accounts") },
        "./RoleList": { RoleList: marker("roles") },
    });
    return { load, get };
}
test("client layout contains header, footer, sidebar and page content", () => {
    const load = loader({
        "@/components/layout/Sidebar": { Sidebar: marker("sidebar") },
        "@/components/layout/header": { Header: marker("header") },
        "@/components/layout/footer": { Footer: marker("footer") },
        "@/contexts/loadingContext": {
            LoadingProvider: ({ children }) => children,
        },
        "@/components/ui/ChatWidget": { ChatWidget: () => null },
    });
    const Layout = load("app/(main)/layout.tsx").default;
    const html = renderToStaticMarkup(
        React.createElement(
            Layout,
            {},
            React.createElement("p", {}, "Sprint1-content"),
        ),
    );
    for (const text of [
        "sidebar",
        "header",
        "footer",
        "Sprint1-content",
        "<main",
    ])
        assert.ok(html.includes(text));
});
for (const loggedIn of [false, true]) {
    test(`admin layout: ${loggedIn ? "renders authenticated shell" : "redirects guest"}`, async () => {
        const f = pageFixture(
            loggedIn
                ? {
                      ho_ten: "Admin",
                      email: "e@example.com",
                      vai_tro: { ten_vai_tro: "chuyen_vien" },
                  }
                : null,
        );
        const Layout = f.load("app/admin/(dashboard)/layout.tsx").default;
        if (!loggedIn)
            await assert.rejects(
                Layout({ children: "content" }),
                /REDIRECT:\/admin\/login/,
            );
        else {
            const html = renderToStaticMarkup(
                await Layout({ children: "content" }),
            );
            for (const text of [
                "admin-sidebar",
                "admin-header",
                "content",
                "<main",
            ])
                assert.ok(html.includes(text));
        }
    });
}
for (const page of ["accounts", "roles"]) {
    for (const role of [null, "chuyen_vien", "super_admin"]) {
        test(`${page} page access: ${role || "guest"}`, async () => {
            const f = pageFixture(
                role
                    ? { ma_admin: "actor", vai_tro: { ten_vai_tro: role } }
                    : null,
            );
            const Page = f.load(
                `app/admin/(dashboard)/${page}/page.tsx`,
            ).default;
            const props = { searchParams: Promise.resolve({}) };
            if (role === "super_admin") {
                assert.ok(
                    renderToStaticMarkup(await Page(props)).includes(
                        `data-testid="${page}"`,
                    ),
                );
                assert.equal(f.get.mock.callCount(), 1);
            } else {
                await assert.rejects(
                    Page(props),
                    new RegExp(
                        `REDIRECT:${role ? "/admin$" : "/admin/login$"}`,
                    ),
                );
                assert.equal(f.get.mock.callCount(), 0);
            }
        });
    }
}
for (const role of ["chuyen_vien", "super_admin"]) {
    test(`admin sidebar account/role links: ${role}`, () => {
        const load = loader({
            "next/navigation": { usePathname: () => "/admin" },
            "next/link": {
                __esModule: true,
                default: ({ children, ...props }) =>
                    React.createElement("a", props, children),
            },
        });
        const Sidebar = load("components/admin/AdminSidebar.tsx").AdminSidebar;
        const html = renderToStaticMarkup(
            React.createElement(Sidebar, { role }),
        );
        for (const route of ["/admin/accounts", "/admin/roles"])
            assert.equal(
                html.includes(`href="${route}"`),
                role === "super_admin",
            );
    });
}
for (const scenario of [
    "guest",
    "invalid token",
    "valid token",
    "login guest",
    "login authenticated",
]) {
    test(`middleware: ${scenario}`, async () => {
        const load = loader({
            "@/services/token.service": {
                tokenService: {
                    verifyAccessToken: async () =>
                        scenario === "invalid token"
                            ? null
                            : { userId: "actor" },
                },
            },
            "next/server": {
                NextResponse: {
                    next: () => ({ next: true }),
                    redirect: (url) => ({ redirect: url.href }),
                },
            },
        });
        const pathname = scenario.startsWith("login")
            ? "/admin/login"
            : "/admin/quan-ly-nganh-hoc";
        const hasToken = [
            "invalid token",
            "valid token",
            "login authenticated",
        ].includes(scenario);
        const result = await load("middleware.ts").middleware({
            url: `https://example.com${pathname}`,
            nextUrl: { pathname },
            cookies: {
                get: () => (hasToken ? { value: "access" } : undefined),
            },
        });
        if (["guest", "invalid token"].includes(scenario))
            assert.equal(
                result.redirect,
                `https://example.com/api/auth/refresh?redirect=${encodeURIComponent(pathname)}`,
            );
        else if (scenario === "login authenticated")
            assert.equal(result.redirect, "https://example.com/admin");
        else assert.deepEqual(result, { next: true });
    });
}
