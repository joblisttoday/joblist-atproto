import { describe, expect, it } from 'vitest';
import config from '#lib/data/config.json' with { type: 'json' };
import metadata from '../../../static/client-metadata.json' with { type: 'json' };

describe('client metadata', () => {
	it('allows writing every record type of the app', () => {
		const scopes = metadata.scope.split(' ');
		for (const nsid of Object.values(config.collections)) expect(scopes).toContain(`repo:${nsid}`);
	});
});
