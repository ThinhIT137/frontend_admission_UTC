const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loader } = require("./helpers.cjs");
const { SignJWT, jwtVerify } = require("jose");

// Public test-only keys; never read .env or use deployment secrets.
const accessKey = "sprint1-access-test-key-32-bytes-minimum";
const refreshKey = "sprint1-refresh-test-key-32-bytes-minimum";
const encode = (value) => new TextEncoder().encode(value);
function fixture() {
    const names = ["JWT_ACCESSTOKEN", "JWT_REFRESHTOKEN"];
    const previous = names.map((name) => process.env[name]);
    try {
        process.env.JWT_ACCESSTOKEN = accessKey;
        process.env.JWT_REFRESHTOKEN = refreshKey;
        // Real token service, real libs/token.ts and real jose; no crypto mocks.
        return loader()("services/token.service.ts").tokenService;
    } finally {
        names.forEach((name, i) => {
            if (previous[i] === undefined) delete process.env[name];
            else process.env[name] = previous[i];
        });
    }
}
for (const [kind, key, lifetime] of [
    ["Access", accessKey, 900],
    ["Refresh", refreshKey, 604800],
]) {
    test(`${kind} JWT: real HS256 signature, identity and expiration`, async () => {
        const service = fixture();
        const before = Math.floor(Date.now() / 1000);
        const token = await service[`generate${kind}Token`]("admin-123");
        const after = Math.floor(Date.now() / 1000);
        // Independent verification rejects a broken signing implementation.
        const { payload, protectedHeader } = await jwtVerify(
            token,
            encode(key),
            { algorithms: ["HS256"] },
        );
        assert.equal(protectedHeader.alg, "HS256");
        assert.equal(payload.userId, "admin-123");
        assert.equal(payload.sub, "admin-123");
        assert.ok(payload.iat >= before && payload.iat <= after);
        assert.equal(payload.exp - payload.iat, lifetime);
        assert.deepEqual(await service[`verify${kind}Token`](token), payload);
    });
    test(`${kind} JWT rejects wrong signing key`, async () => {
        const token = await new SignJWT({ userId: "admin-123" })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("15m")
            .sign(encode("different-test-key-32-bytes-minimum"));
        assert.equal(await fixture()[`verify${kind}Token`](token), null);
    });
    test(`${kind} JWT rejects altered payload`, async () => {
        const service = fixture();
        const parts = (
            await service[`generate${kind}Token`]("admin-123")
        ).split(".");
        const payload = JSON.parse(
            Buffer.from(parts[1], "base64url").toString(),
        );
        parts[1] = Buffer.from(
            JSON.stringify({ ...payload, userId: "attacker" }),
        ).toString("base64url");
        assert.equal(
            await service[`verify${kind}Token`](parts.join(".")),
            null,
        );
    });
    test(`${kind} JWT rejects expired token signed with correct key`, async () => {
        const token = await new SignJWT({ userId: "admin-123" })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt(Math.floor(Date.now() / 1000) - 120)
            .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
            .sign(encode(key));
        assert.equal(await fixture()[`verify${kind}Token`](token), null);
    });
    test(`${kind} JWT rejects malformed, empty and unsigned token`, async () => {
        const verify = fixture()[`verify${kind}Token`];
        const unsigned = `${Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url")}.${Buffer.from(JSON.stringify({ userId: "attacker" })).toString("base64url")}.`;
        for (const token of ["", "not-a-jwt", unsigned])
            assert.equal(await verify(token), null);
    });
}
test("generateToken returns access/refresh pair with isolated signing keys", async () => {
    const service = fixture();
    const [access, refresh] = await service.generateToken("admin-123");
    assert.notEqual(access, refresh);
    assert.equal((await service.verifyAccessToken(access)).userId, "admin-123");
    assert.equal(
        (await service.verifyRefreshToken(refresh)).userId,
        "admin-123",
    );
    assert.equal(await service.verifyAccessToken(refresh), null);
    assert.equal(await service.verifyRefreshToken(access), null);
});
