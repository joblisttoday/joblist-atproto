import { describe, expect, it } from 'vitest';
import config from '#lib/data/config.json' with { type: 'json' };
import metadata from '../../../static/client-metadata.json' with { type: 'json' };
import permissionSet from '../../../lexicons/today/joblist/authFull.json' with { type: 'json' };

describe('client metadata', () => {
	it('asks for the permission set, which allows writing every record type of the app', () => {
		expect(metadata.scope.split(' ')).toEqual(['atproto', `include:${config.lexicons.permissionSet}`]);
		expect(permissionSet.id).toBe(config.lexicons.permissionSet);
		const allowed = permissionSet.defs.main.permissions.flatMap((p) => (p.resource === 'repo' ? p.collection : []));
		for (const nsid of Object.values(config.collections)) expect(allowed).toContain(nsid);
	});
});
