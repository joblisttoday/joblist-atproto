import { safeUrl } from './url.js';
import config from '#lib/data/config.json' with { type: 'json' };
import providers from '#lib/data/providers.json' with { type: 'json' };

/**
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {{name?: string, address?: string, country?: string, latitude?: string, longitude?: string}} Location
 * @typedef {{provider?: string, id?: string, url?: string}} JobBoard
 * @typedef {{
 *   key: string,
 *   name: string,
 *   url?: string,
 *   description?: string,
 *   tags: string[],
 *   locations: Location[],
 *   jobBoard?: JobBoard,
 *   links: string[],
 *   verified: boolean,
 *   unchecked: boolean,
 *   editedAt: string,
 *   record: RepoRecord,
 *   versions: RepoRecord[]
 * }} Company
 */

/**
 * The record key for a website: its bare, lowercase host name.
 * @param {string} input a URL or a domain
 */
export function toDomain(input) {
	const value = (input || '').trim().toLowerCase();
	if (!value) return '';
	try {
		const url = new URL(value.includes('://') ? value : `https://${value}`);
		return url.hostname.replace(/^www\./, '');
	} catch {
		return '';
	}
}

/**
 * Whether a record is written by the organization itself
 * (the author's handle is the record's domain).
 * @param {RepoRecord} record
 * @param {Map<string, {handle: string}>} profiles
 */
export function isOwnRecord(record, profiles) {
	return profiles.get(record.did)?.handle === record.rkey;
}

/**
 * When a version was last edited, as its author says. A date in the future is not
 * believed (it would keep that version on top for good): such a version counts as undated.
 * @param {RepoRecord} record
 * @param {number} [now]
 */
export function editedAt(record, now = Date.now()) {
	const date = String(record.value.updatedAt || record.value.createdAt || '');
	return Date.parse(date) > now ? '' : date;
}

/**
 * Versions, most recently edited first (one per author: the record key is the domain).
 * @param {RepoRecord[]} versions
 */
export function byRecent(versions) {
	return [...versions].sort((a, b) => editedAt(b).localeCompare(editedAt(a)));
}

/**
 * Pick the version shown for a company, like a wiki page:
 * the organization's own record, otherwise the most recent edit by anyone.
 * @param {RepoRecord[]} versions
 * @param {Map<string, {handle: string}>} profiles
 */
export function pickVersion(versions, profiles) {
	return versions.find((v) => isOwnRecord(v, profiles)) || byRecent(versions)[0];
}

/**
 * Whether a version was written by a bot (config.bots) and no person
 * has saved a newer version since: nobody has checked it yet.
 * @param {RepoRecord} version
 * @param {RepoRecord[]} versions
 * @param {string[]} [bots]
 */
export function isUnchecked(version, versions, bots = config.bots) {
	if (!bots.includes(version.did)) return false;
	return !versions.some((v) => !bots.includes(v.did) && editedAt(v) > editedAt(version));
}

/** Fields of a company record compared between versions, with their form label. */
export const FIELDS = /** @type {const} */ ([
	['name', 'form.name'],
	['url', 'form.website'],
	['description', 'form.description'],
	['tags', 'form.tags'],
	['locations', 'form.locations'],
	['jobBoard', 'form.section.jobs'],
	['links', 'form.links']
]);

/**
 * Which fields differ between two versions (as form label keys).
 * @param {RepoRecord} a
 * @param {RepoRecord} b
 */
export function changedFields(a, b) {
	return FIELDS.filter(([field]) => JSON.stringify(a.value[field]) !== JSON.stringify(b.value[field])).map(
		([, label]) => label
	);
}

/**
 * A version's content saved again as the signed-in person's own version
 * (restore an older version, or confirm a bot's one).
 * @param {Record<string, any>} value the content to save
 * @param {string} [createdAt] when this person first described the company
 * @param {string} [now]
 */
export function copyRecord(value, createdAt, now = new Date().toISOString()) {
	return { ...value, $type: 'today.joblist.company', createdAt: createdAt || now, updatedAt: now };
}

/**
 * @param {RepoRecord[]} versions all records sharing one key
 * @param {Map<string, {handle: string}>} profiles
 * @returns {Company}
 */
export function toCompany(versions, profiles) {
	const record = pickVersion(versions, profiles);
	const v = record.value;
	return {
		key: record.rkey,
		name: v.name || record.rkey,
		url: safeUrl(v.url) || undefined,
		description: v.description,
		tags: v.tags || [],
		locations: v.locations || [],
		jobBoard: v.jobBoard,
		links: (v.links || []).map((/** @type {unknown} */ link) => safeUrl(link)).filter(Boolean),
		verified: isOwnRecord(record, profiles),
		// A company's own record is never "the crawler's", even from a bot account.
		unchecked: !isOwnRecord(record, profiles) && isUnchecked(record, versions),
		editedAt: editedAt(record),
		record,
		versions: byRecent(versions)
	};
}

/**
 * Link to the company's job board page.
 * @param {JobBoard | undefined} jobBoard
 */
export function boardUrl(jobBoard) {
	if (!jobBoard) return '';
	const provider = providers.find((p) => p.id === jobBoard.provider);
	if (provider && jobBoard.id) return provider.board.replace('{id}', jobBoard.id);
	return safeUrl(jobBoard.url);
}

/** @param {Company} company */
export function hasJobsApi(company) {
	const { provider, id } = company.jobBoard || {};
	return Boolean(id && providers.some((p) => p.id === provider));
}

/**
 * Locations that can be drawn on a map.
 * @param {Company} company
 */
export function mapPoints(company) {
	return locationPoints(company.locations);
}

/**
 * The places that say where they are (latitude and longitude), with them as numbers.
 * @param {Location[]} locations
 */
export function locationPoints(locations) {
	return locations
		.map((l) => ({ ...l, lat: Number(l.latitude), lon: Number(l.longitude) }))
		.filter((l) => l.latitude && l.longitude && Number.isFinite(l.lat) && Number.isFinite(l.lon));
}

/**
 * Text used to search companies.
 * @param {Company} company
 */
export function searchText(company) {
	return [
		company.name,
		company.key,
		company.tags.join(' '),
		company.locations.map((l) => `${l.name || ''} ${l.country || ''}`).join(' ')
	]
		.join(' ')
		.toLowerCase();
}

/**
 * Companies matching every word of a query, by name, domain, tag or place.
 * @param {Iterable<Company>} companies
 * @param {string} query
 * @param {number} limit
 */
export function searchCompanies(companies, query, limit) {
	const words = query.toLowerCase().split(/\s+/).filter(Boolean);
	if (!words.length) return [];
	/** @type {Company[]} */
	const found = [];
	for (const company of companies) {
		const text = searchText(company);
		if (words.every((w) => text.includes(w))) found.push(company);
		if (found.length >= limit) break;
	}
	return found;
}

/**
 * A company record from form values.
 * @param {{name: string, url: string, description: string, tags: string, provider: string, boardId: string, careersUrl: string, locations: Location[], links: string}} form
 * @param {string} [createdAt] when this person first described the company
 * @param {string} [now]
 */
export function toRecord(form, createdAt, now = new Date().toISOString()) {
	/** @type {Record<string, any>} */
	const record = {
		$type: 'today.joblist.company',
		name: form.name.trim(),
		createdAt: createdAt || now,
		updatedAt: now
	};
	if (form.url.trim()) record.url = withScheme(form.url);
	if (form.description.trim()) record.description = form.description.trim();
	const tags = splitList(form.tags).map((t) => t.toLowerCase());
	if (tags.length) record.tags = tags;
	const locations = form.locations.filter((l) => Object.values(l).some((x) => String(x || '').trim()));
	if (locations.length) record.locations = locations;
	if (form.provider && form.boardId.trim()) {
		record.jobBoard = { provider: form.provider, id: form.boardId.trim() };
	} else if (form.careersUrl.trim()) {
		record.jobBoard = { url: withScheme(form.careersUrl) };
	}
	const links = splitList(form.links).map(withScheme);
	if (links.length) record.links = links;
	return record;
}

/**
 * Form values from a company (or empty).
 * @param {Company | null} company
 */
export function toForm(company) {
	return {
		name: company?.name || '',
		url: company?.url || '',
		description: company?.description || '',
		tags: (company?.tags || []).join(', '),
		provider: company?.jobBoard?.provider || '',
		boardId: company?.jobBoard?.id || '',
		careersUrl: company?.jobBoard?.url || '',
		locations: (company?.locations || []).map((l) => ({ ...l })),
		links: (company?.links || []).join('\n')
	};
}

/** @param {string} text */
function splitList(text) {
	return text
		.split(/[,\n]/)
		.map((s) => s.trim())
		.filter(Boolean);
}

/** @param {string} url */
function withScheme(url) {
	const value = url.trim();
	return value.includes('://') ? value : `https://${value}`;
}
