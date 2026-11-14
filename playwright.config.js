import { defineConfig, devices } from '@playwright/test';

/**
 * The end-to-end tests on the built site, as GitHub Pages serves it (e2e/serve.js).
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
