import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kindOf, needListsReport, proposeNeedLists } from './need-lists.js';

test('kinds come only from clear words, and "NOT a co-op" is not a co-op', () => {
	assert.equal(kindOf({ id: 'a', name: 'A', need: 'care', type: 'worker-owned home-care co-op (largest US worker co-op)' }), 'cooperative');
	assert.equal(kindOf({ id: 'b', name: 'B', need: 'care', type: 'non-profit FOUNDATION (stichting) with self-managing nurse teams; NOT a co-op' }), 'nonprofit');
	assert.equal(kindOf({ id: 'c', name: 'C', need: 'digital', type: 'public agency that invests in open digital infrastructure' }), 'public');
	assert.equal(kindOf({ id: 'd', name: 'D', need: 'housing', type: 'network', summary: 'Houses bought together and taken off the market.' }), '');
	assert.equal(kindOf({ id: 'e', name: 'E', need: 'food', type: 'network', summary: 'A cooperative of farms; not a scoop of anything.' }), 'cooperative');
	// Found wrong once by reading the map's entries, now right:
	assert.equal(kindOf({ id: 's', name: 'Signal', need: 'digital', type: 'non-profit foundation running a centralised messenger; NOT member-owned' }), 'nonprofit');
	assert.equal(kindOf({ id: 'k', name: 'Kerala', need: 'care', type: 'community volunteer network, with state support and local-government funding' }), '');
	assert.equal(kindOf({ id: 'm', name: 'Mediapart', need: 'knowledge', type: 'organisation', summary: 'A news site owned by a non-profit fund.' }), '');
	assert.equal(kindOf({ id: 'h', name: 'CHF Canada', need: 'housing', type: 'federation', summary: "Canada's federation of non-profit housing co-ops." }), 'cooperative');
	assert.equal(kindOf({ id: 'sc', name: 'Seed Commons', need: 'money', type: 'network', summary: 'A US network of loan funds lending to worker co-ops and community businesses.' }), '');
	assert.equal(kindOf({ id: 'ar', name: 'Arapaima', need: 'land-nature', type: 'network of communities with support NGOs (e.g. ASPROC)' }), '');
});

test('one list per need: members by website, each once, their ways to contribute', () => {
	const lists = proposeNeedLists(
		[
			{ id: 'x', name: 'X Co-op', need: 'energy', type: 'cooperative', link: 'https://www.x.coop/en', countries: ['DE'], actions: [{ kind: 'join', text: 'Become a member.' }, { kind: 'use', text: 'Buy its power.' }, { kind: 'lend', text: 'Lend to it.' }], file: 'https://c.example/files/map/x.yml' },
			{ id: 'y', name: 'X again', need: 'energy', type: 'network', link: 'https://x.coop' },
			{ id: 'z', name: 'Z', need: 'energy', type: 'movement', link: null },
			{ id: 'w', name: 'W', need: 'housing', type: 'network', link: 'https://w.org' }
		],
		new Set(['w.org'])
	);
	const energy = lists.find((l) => l.need === 'energy');
	assert.deepEqual(energy?.members.map((m) => [m.key, m.kind, m.known]), [['x.coop', 'cooperative', false]]);
	assert.deepEqual(energy?.members[0].contribute, [{ kind: 'join', text: 'Become a member.' }, { kind: 'fund', text: 'Lend to it.' }]);
	assert.deepEqual(energy?.skipped.map((s) => s.reason), ['same website as another (x.coop)', 'no website']);
	assert.equal(lists.find((l) => l.need === 'housing')?.members[0].known, true);
	assert.match(needListsReport(lists, { source: 'test', readAt: 'now' }), /## Energy commons \(1\)/);
});

test('networks are told apart from single organizations by their type', async () => {
	const { isNetwork } = await import('./need-lists.js');
	assert.equal(isNetwork({ id: 'a', name: 'A', need: 'energy', type: 'federation (conservancies + support organisation association)' }), true);
	assert.equal(isNetwork({ id: 'b', name: 'B', need: 'energy', type: 'networked co-op' }), false);
	assert.equal(isNetwork({ id: 'c', name: 'C', need: 'energy', type: 'single org' }), false);
});

test('writes: new organizations credited and capped, lists created once then extended', async () => {
	const { planWrites } = await import('./need-lists.js');
	const member = (/** @type {string} */ key, known = false) => ({ key, name: key.toUpperCase(), link: `https://${key}`, kind: '', network: key === 'n.org', countries: ['AR', 'xx'], summary: 'What it is.', contribute: [{ kind: 'join', text: 'Join it.' }], source: '', checked: '2026-11-05', known });
	const lists = [{ need: 'energy', name: 'Energy commons', description: 'Energy.', members: [member('a.org'), member('n.org'), member('k.org', true)], skipped: [] }];
	const now = '2026-11-08T00:00:00.000Z';

	const first = planWrites(lists, { own: new Set(), ownLists: [], perRun: 1, now });
	assert.deepEqual(first.map((w) => [w.action, w.rkey ?? w.value.name]), [['create', 'a.org'], ['create', 'Energy commons']]);
	assert.deepEqual(first[0].value.locations, [{ country: 'Argentina', countryCode: 'AR' }]);
	assert.deepEqual(first[0].value.contribute, [{ kind: 'join', text: 'Join it.' }]);
	assert.match(first[0].value.description, /^What it is\.\n\nFrom the commons map \(https:\/\/komm1234\.gitlab\.io\/commons\/explore\), checked 2026-11-05\.$/);
	assert.deepEqual(first[1].value.companies, ['a.org', 'k.org']);

	const ownLists = [{ rkey: 'L', value: first[1].value }];
	const second = planWrites(lists, { own: new Set(['a.org']), ownLists, perRun: 10, now });
	assert.deepEqual(second.map((w) => [w.action, w.rkey]), [['create', 'n.org'], ['update', 'L']]);
	assert.deepEqual(second[0].value.tags, ['network']);
	assert.deepEqual(second[1].value.companies, ['a.org', 'k.org', 'n.org']);

	assert.deepEqual(planWrites(lists, { own: new Set(['a.org', 'n.org']), ownLists: [{ rkey: 'L', value: second[1].value }], perRun: 10, now }), []);
});
