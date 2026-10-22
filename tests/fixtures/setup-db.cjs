const { spawnSync } = require('node:child_process');
const { seed, TEST_DATABASE_URL } = require('./seed.cjs');
const result = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--schema', 'prisma/schema.prisma'], {
  stdio: 'inherit', windowsHide: true, env: { ...process.env, DIRECT_URL: TEST_DATABASE_URL, DATABASE_URL: TEST_DATABASE_URL },
});
if (result.status !== 0) process.exit(result.status || 1);
seed().catch(err => { console.error(err.message); process.exitCode = 1; });
