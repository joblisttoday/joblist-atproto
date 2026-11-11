import config from '../../src/lib/data/config.json' with { type: 'json' };
import { api } from './api.js';

/**
 * joblist's counts (counts.json of the snapshot: each organization's open jobs, and every
 * domain joblist knows), kept by the add-on and read again at most every few hours: the
 * button tells at a glance from them, and no site visited is ever looked up.
 * @typedef {import('../../src/lib/models/glance.js').Counts} Counts
 */

const MAX_AGE = config.snapshot.everyHours * 3600 * 1000;
/** @type {Promise<Counts> | null} */
let reading = null;

/** @returns {Promise<Counts>} */
export function counts() {
	reading ??= (async () => {
		const { counts: kept, countsAt = 0 } = await api.storage.local.get(['counts', 'countsAt']);
		if (kept && Date.now() - countsAt < MAX_AGE) return kept;
		try {
			const res = await fetch(`${config.snapshot.path}/counts.json`);
			if (!res.ok) throw new Error(String(res.status));
			const file = await res.json();
			const offers = file.offers && typeof file.offers === 'object' ? file.offers : {};
			// Before counts.json listed every domain: those hiring.
			const fresh = { offers, known: Array.isArray(file.known) ? file.known : Object.keys(offers) };
			await api.storage.local.set({ counts: fresh, countsAt: Date.now() });
			return fresh;
		} catch {
			return kept || { offers: {}, known: [] };
		}
	})().finally(() => setTimeout(() => (reading = null), 60_000));
	return reading;
}
