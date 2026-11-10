import {spawn} from 'node:child_process';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, process.env.LIGHTHOUSE_OUTPUT || 'qa-artifacts/responsive-implementation/lighthouse');
const target = process.argv[2] || 'http://127.0.0.1:4186/';
let server;
const run = args => new Promise((resolveRun, reject) => {
  const child = spawn(process.execPath, args, {cwd: root, stdio: 'inherit'});
  child.on('error', reject);
  child.on('exit', code => code === 0 ? resolveRun() : reject(new Error(`Lighthouse exited with ${code}`)));
});
try {
  await mkdir(output, {recursive: true});
  if (!process.argv[2]) {
    server = spawn(process.execPath, ['scripts/serve.mjs'], {cwd: root, env: {...process.env, PORT: '4186'}, stdio: 'inherit'});
    let serverError;
    server.on('error', error => {serverError = error;});
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      if (serverError) throw serverError;
      if (server.exitCode !== null) throw new Error(`Preview server exited: ${server.exitCode}`);
      try {const response = await fetch(target, {signal: AbortSignal.timeout(1000)}); if (response.status === 200) {ready = true; break;}} catch {}
      await new Promise(done => setTimeout(done, 250));
    }
    if (!ready) throw new Error('Static export unavailable; build the project before auditing.');
  }
  const summary = [];
  for (const mode of ['mobile', 'desktop']) {
    const reportPath = resolve(output, `${mode}.report.json`);
    const args = ['node_modules/lighthouse/cli/index.js', target, '--chrome-flags=--headless', '--only-categories=performance,accessibility,best-practices,seo', '--output=json', '--output=html', `--output-path=${resolve(output, mode)}`, '--quiet'];
    if (mode === 'desktop') args.push('--preset=desktop');
    await run(args);
    const report = JSON.parse(await readFile(reportPath, 'utf8'));
    if (report.runtimeError) throw new Error(JSON.stringify(report.runtimeError));
    summary.push({mode, fetchTime: report.fetchTime, version: report.lighthouseVersion, scores: Object.fromEntries(Object.entries(report.categories).map(([id, category]) => [id, Math.round(category.score * 100)])), warnings: report.runWarnings});
  }
  await writeFile(resolve(output, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} finally {
  server?.kill();
}
