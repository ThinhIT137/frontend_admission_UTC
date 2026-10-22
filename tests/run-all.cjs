// Continue after a failed suite; return nonzero if ANY suite fails.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const workspace = path.dirname(root);
const artifacts = path.join(__dirname, 'artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const pythonPath = process.env.AI_TEST_PYTHONPATH || path.join(root, '.test-tools');
const scoreRoot = path.join(workspace, 'backend_admission/backend_application_score');
const aiRoot = path.join(workspace, 'backend_admission/backend_ai_ml_latest');
const scorePython = process.env.SCORE_TEST_PYTHON || path.join(scoreRoot, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');
const commonEnv = { ...process.env, PYTEST_DISABLE_PLUGIN_AUTOLOAD: '1', PYTHONIOENCODING: 'utf-8', AI_TEST_PYTHONPATH: pythonPath, SCORE_TEST_PYTHON: scorePython };
const jobs = [
  ['frontend', process.execPath, ['--test', '--test-isolation=none', '--test-reporter=tap', ...[1,2,3,4].map(s => `tests/sprint${s}/*.test.cjs`)], root, commonEnv],
  ['score', scorePython, ['-B', '-m', 'pytest', '--import-mode=importlib', '-p', 'no:cacheprovider', 'tests', '-q', '--junitxml=' + path.join(artifacts, 'score.xml')], scoreRoot, { ...commonEnv, PYTHONPATH: '' }],
  ['ai', process.env.AI_TEST_PYTHON || 'python', ['-B', '-m', 'pytest', '--import-mode=importlib', '-p', 'no:cacheprovider', 'tests', '-q', '--junitxml=' + path.join(artifacts, 'ai.xml')], aiRoot, { ...commonEnv, PYTHONPATH: pythonPath }],
  ['contracts', process.execPath, ['--test', '--test-isolation=none', '--test-reporter=tap', 'tests/contracts/*.test.cjs'], root, commonEnv],
  ['typecheck', process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit', '--incremental', 'false'], root, commonEnv],
];
if (process.argv.includes('--database') || process.argv.includes('--browser')) jobs.push(['database', process.execPath, ['--test', '--test-isolation=none', '--test-reporter=tap', 'tests/database/*.test.cjs'], root, commonEnv]);
if (process.argv.includes('--browser')) jobs.push(['browser', process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--config', 'tests/e2e/playwright.config.cjs'], root, commonEnv]);
const summary = [];
for (const [name, command, args, cwd, env] of jobs) {
  console.log(`Running ${name}...`);
  const result = spawnSync(command, args, { cwd, env, encoding: 'utf8', windowsHide: true, timeout: name === 'browser' ? 1200000 : 180000, maxBuffer: 16 * 1024 * 1024 });
  fs.writeFileSync(path.join(artifacts, name + '.log'), (result.stdout || '') + (result.stderr || '') + (result.error ? '\n' + result.error.message : ''));
  summary.push({ suite: name, exitCode: result.status ?? 1, log: `tests/artifacts/${name}.log` });
  console.log(`${name}: ${result.status === 0 ? 'PASS' : 'FAIL'} (see tests/artifacts/${name}.log)`);
}
fs.writeFileSync(path.join(artifacts, 'summary.json'), JSON.stringify({ completedAt: new Date().toISOString(), suites: summary }, null, 2));
process.exitCode = summary.some(s => s.exitCode !== 0) ? 1 : 0;
