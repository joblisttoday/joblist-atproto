import { defineConfig, devices } from '@playwright/test';

/**
 * The quality gate (e2e/quality.spec.js) on the built site, as Cloudflare serves it:
 * the app, its prerendered pages, and the published snapshot. Not the Worker's
 * pages (/in, /field, /feed): they are tested in worker/.
 */
const port = 4318;

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	reporter: 'list',
	use: { baseURL: `http://127.0.0.1:${port}`, ...devices['Desktop Chrome'] },
	webServer: {
		command: `npm run build:site && node e2e/serve.js build ${port}`,
		url: `http://127.0.0.1:${port}`,
		reuseExistingServer: !process.env.CI,
		timeout: 300_000
	}
});
