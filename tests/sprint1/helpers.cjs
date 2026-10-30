const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { mock } = require("node:test");
// Thư mục gốc dự án, tính từ tests/sprint1 để resolve alias @/.
const root = path.resolve(__dirname, "../..");

// Nạp và chạy source TS/TSX thật; overrides thay dependency bằng mock khi cần.
// Chỉ kiểm tra hàm ứng dụng, không mô phỏng compiler Next.js, HTTP hay ràng buộc DB.
function loader(overrides = {}) {
    // Mỗi loader có cache riêng: các fixture không dùng chung trạng thái module.
    const cache = new Map();
    function load(file) {
        file = path.resolve(root, file);
        // Styles are exercised by browser checks, not evaluated as CommonJS.
        if (file === path.join(root, 'components/admin/admin.css')) return {};
        if (cache.has(file)) return cache.get(file).exports;
        const loadedModule = { exports: {} };
        // Lưu trước khi nạp dependency để hỗ trợ các module import vòng.
        cache.set(file, loadedModule);
        // Chuyển TypeScript/JSX sang JavaScript CommonJS trong bộ nhớ.
        // Transpile không kiểm tra kiểu; dùng tsc riêng để kiểm tra TypeScript.
        const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2022,
                jsx: ts.JsxEmit.ReactJSX,
                esModuleInterop: true,
            },
            fileName: file,
        }).outputText;
        function resolve(id) {
            // Ưu tiên mock theo đúng chuỗi import mà source sử dụng.
            if (Object.hasOwn(overrides, id)) return overrides[id];
            // Resolve alias @/ và đường dẫn tương đối, rồi nạp source đệ quy.
            if (id.startsWith("@/") || id.startsWith(".")) {
                const base = id.startsWith("@/")
                    ? path.join(root, id.slice(2))
                    : path.resolve(path.dirname(file), id);
                for (const suffix of ["", ".ts", ".tsx", ".js", "/index.ts"]) {
                    if (
                        fs.existsSync(base + suffix) &&
                        fs.statSync(base + suffix).isFile()
                    )
                        return load(base + suffix);
                }
                throw new Error(`Cannot resolve ${id} from ${file}`);
            }
            // Package như React/jose dùng thư viện thật nếu không có override.
            return require(id);
        }
        // Chạy source với require tùy chỉnh và đối tượng exports của module.
        // Chỉ dùng cho source tin cậy trong dự án, không phải sandbox bảo mật.
        new Function("require", "module", "exports", source)(
            resolve,
            loadedModule,
            loadedModule.exports,
        );
        return loadedModule.exports;
    }
    return load;
}
// Tạo bộ dependency mới cho từng test; trả về mock để test cấu hình và kiểm tra lời gọi.
function fixture() {
    // mock.fn ghi lại arguments, số lần gọi; test có thể đổi kết quả bằng mockImplementation.
    const model = () =>
        Object.fromEntries(
            [
                "findUnique",
                "findFirstOrThrow",
                "findMany",
                "count",
                "create",
                "update",
                "delete",
            ].map((name) => [name, mock.fn(async () => undefined)]),
        );
    const db = {
        admin: model(),
        vaiTro: model(),
        nganhHoc: model(),
        chuongTrinhDaoTao: model(),
    };
    // Chạy callback transaction với DB mock; không kiểm tra commit/rollback thật.
    db.$transaction = mock.fn(async (callback) => callback(db));
    // Giả lập cookie để test không cần request context của Next.js.
    const cookies = Object.fromEntries(
        ["setToken", "deleteCookie", "getCookie"].map((n) => [
            n,
            mock.fn(async () => undefined),
        ]),
    );
    // Mặc định token hợp lệ với userId actor; test lỗi sẽ ghi đè kết quả.
    // Việc ký/xác minh JWT thật được kiểm tra riêng trong token.test.cjs.
    const tokens = {
        generateToken: mock.fn(async () => ["access", "refresh"]),
        verifyAccessToken: mock.fn(async () => ({ userId: "actor" })),
        verifyRefreshToken: mock.fn(async () => ({ userId: "actor" })),
    };
    // Giả lập bcrypt để tập trung vào luồng nghiệp vụ, không kiểm tra thuật toán băm.
    const password = {
        verifyPassword: mock.fn(async () => true),
        hashPassword: mock.fn(async () => "hashed"),
    };
    // Theo dõi cache invalidation mà không gọi cache runtime của Next.js.
    const revalidatePath = mock.fn();
    // Cả prisma và prismaPublic dùng DB mock; không truy cập database thật.
    const load = loader({
        "@/libs/prisma": { __esModule: true, default: db, prismaPublic: db },
        "./cookie.service": { cookieService: cookies },
        "./token.service": { tokenService: tokens },
        "@/libs/utils/password": password,
        "next/cache": { revalidatePath },
    });
    // adminService là source thật, chạy với các dependency đã thay thế ở trên.
    const admin = load("services/user.service.ts").adminService;
    return { db, cookies, tokens, password, load, admin, revalidatePath };
}
module.exports = { loader, fixture };
