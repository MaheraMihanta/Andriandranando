import { defineConfig } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontend = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(frontend);
const python = path.join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
process.env.E2E_DATABASE_PATH ||= path.join(mkdtempSync(path.join(tmpdir(), 'ny-andriandranando-')), 'test.sqlite3');

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:5174', channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true, screenshot: 'only-on-failure' },
  webServer: [
    { command: `"${python}" e2e/server.py`, url: 'http://127.0.0.1:8011/api/actualites/', timeout: 120000, reuseExistingServer: false, env: { DATABASE_PATH: process.env.E2E_DATABASE_PATH, DJANGO_DEBUG: 'true', DJANGO_API_TOKEN: '' } },
    { command: 'npm run dev -- --port 5174 --strictPort', url: 'http://127.0.0.1:5174', timeout: 60000, reuseExistingServer: false, env: { DJANGO_DEV_PROXY_URL: 'http://127.0.0.1:8011' } },
  ],
});
