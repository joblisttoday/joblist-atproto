import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

// jsDelivr serves embed/dist from the repository: it must be the embed's source, built.
test('embed/dist is the embed built from its source (npm run build:embed)', () => {
	const out = mkdtempSync(join(tmpdir(), 'embed-'));
	execFileSync('node', ['scripts/build-embed.js', out], { stdio: 'ignore' });
	assert.equal(readFileSync(join(out, 'joblist-jobs.js'), 'utf8'), readFileSync('embed/dist/joblist-jobs.js', 'utf8'), 'embed/dist is out of date: npm run build:embed');
});
