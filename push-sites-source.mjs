import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const cfg = JSON.parse(readFileSync(0, 'utf8'));
const cwd = cfg.cwd;
const git = cfg.git;
const authEnv = {
  ...process.env,
  GIT_CONFIG_COUNT: '1',
  GIT_CONFIG_KEY_0: 'http.extraHeader',
  GIT_CONFIG_VALUE_0: `Authorization: Bearer ${cfg.token}`,
};

function run(args, env = process.env) {
  const result = spawnSync(git, args, { cwd, env, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `git ${args[0]} failed`);
  return result.stdout.trim();
}

run(['init']);
run(['config', 'user.name', 'Codex']);
run(['config', 'user.email', 'codex@openai.com']);
run(['add', '.']);
run(['commit', '-m', 'Build Kavin P photography portfolio']);
const hasOrigin = spawnSync(git, ['remote', 'get-url', 'origin'], { cwd, encoding: 'utf8' }).status === 0;
run(hasOrigin ? ['remote', 'set-url', 'origin', cfg.remote] : ['remote', 'add', 'origin', cfg.remote]);
run(['push', '-u', 'origin', `${cfg.branch}:${cfg.branch}`], authEnv);
process.stdout.write(JSON.stringify({ commit_sha: run(['rev-parse', 'HEAD']) }));
