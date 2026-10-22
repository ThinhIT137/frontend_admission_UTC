const { spawn } = require('node:child_process');
const { TEST_DATABASE_URL } = require('../fixtures/seed.cjs');
const env = { ...process.env,
  DATABASE_URL: TEST_DATABASE_URL, DATABASE_URL_PUBLIC: TEST_DATABASE_URL + '&pgbouncer=true', DIRECT_URL: TEST_DATABASE_URL,
  JWT_ACCESSTOKEN: 'sprint-test-access-secret-32-characters', JWT_REFRESHTOKEN: 'sprint-test-refresh-secret-32-characters',
  NEXT_PUBLIC_API_AI_ML: 'http://127.0.0.1:58000', NEXT_PUBLIC_API_APPLICATION_SCORE: 'http://127.0.0.1:58001',
  API_AI_ML: 'http://127.0.0.1:58000', API_APPLICATION_SCORE: 'http://127.0.0.1:58001',
  AI_INTERNAL_API_KEY: 'integration-only-key', INTERNAL_API_KEY: 'integration-only-key',
  NVIDIA_API_KEY: '', DEBUG: 'false',
  EMAIL_PROVIDER: 'mock', SMS_GATEWAY_URL: '', SMS_GATEWAY_TOKEN: '',
  SUPABASE_URL: 'http://127.0.0.1:58002', SUPABASE_SERVICE_ROLE_KEY: 'isolated-storage-key', SUPABASE_EVIDENCE_BUCKET: 'test-evidence',
  NEXT_TELEMETRY_DISABLED: '1', ADMISSION_E2E: '1',
};
let child;
const backends = [];
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { child?.kill(signal); for (const backend of backends) backend.kill(); });
process.on('exit', () => { for (const backend of backends) backend.kill(); });
function run(args) {
  return new Promise((resolve, reject) => {
    child = spawn(process.execPath, ['node_modules/next/dist/bin/next', ...args], { env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(Error(`Next.js exited with ${code}`)));
  });
}
(async () => {
  const path = require('node:path');
  const workspace = path.resolve(__dirname, '../../..');
  backends.push(spawn(process.execPath, [path.join(__dirname, 'storage-server.cjs')], { env, stdio: 'inherit', windowsHide: true }));
  for (const service of ['score', 'ai']) {
    const python = service === 'score' ? path.join(workspace, 'backend_admission/backend_application_score/.venv/Scripts/python.exe') : process.env.AI_TEST_PYTHON || 'python';
    backends.push(spawn(python, ['-B', path.join(__dirname, 'backend-server.py'), service], {
      env: { ...env, DATABASE_URL_PUBLIC: TEST_DATABASE_URL, PYTHONIOENCODING: 'utf-8', PYTHONPATH: path.resolve(__dirname, '../../.test-tools') }, stdio: 'inherit', windowsHide: true,
    }));
  }
  for (const port of [58000, 58001]) {
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!ready) throw Error(`Test backend ${port} did not start`);
  }
  if (process.env.ADMISSION_E2E_SKIP_BUILD !== '1') await run(['build', '--webpack']);
  await run(['start', '--hostname', '127.0.0.1', '--port', '3300']);
})().catch(err => { console.error(err.message); for (const backend of backends) backend.kill(); process.exitCode = 1; });
