import { safeUrl } from './url.js';
import { capRecord } from './limits.js';
import config from '#lib/data/config.json' with { type: 'json' };
import providers from '#lib/data/providers.json' with { type: 'json' };

/**
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {{handle: string, verified?: boolean}} Handle
 *   verified: whether the handle was checked both ways by the indexer (indexer/handles.js);
 *   left out when it was not, and then the AppView's handle is believed.
 * @typedef {{name?: string, address?: string, country?: string, latitude?: string, longitude?: string}} Location
 * @typedef {{provider?: string, id?: string, url?: string}} JobBoard
 * @typedef {{kind: string, text?: string, url?: string}} Contribution
 *   A way to take part besides a job (lexicons/today/joblist/company.json #contribution).
 * @typedef {{
 *   key: string,
 *   name: string,
 *   url?: string,
 *   description?: string,
 *   kind: string,
 *   tags: string[],
 *   locations: Location[],
 *   jobBoard?: JobBoard,
 *   links: string[],
 *   contribute: Contribution[],
 *   verified: boolean,
 *   unchecked: boolean,
 *   editedAt: string,
 *   record: RepoRecord,
 *   versions: RepoRecord[]
 * }} Company
 */

const DOMAIN_MAX = 253;

/**
 * The record key for a website: its bare, lowercase host name.
 * @param {string} input a URL or a domain
 */
export function toDomain(input) {
	const value = (input || '').trim().toLowerCase();
	if (!value) return '';
	try {
		const url = new URL(value.includes('://') ? value : `https://${value}`);
		const host = url.hostname.replace(/^www\./, '');
		// A domain name is at most 253 characters (lexicons/today/joblist/company.json).
		return host.length <= DOMAIN_MAX ? host : '';
	} catch {
		return '';
	}
}

/**
 * Whether an account speaks for a domain: its handle is the domain, and the
 * indexer did not find otherwise when it checked the handle both ways.
 * @param {Map<string, Handle>} profiles
 * @param {string} did
 * @param {string} domain
 */
export function speaksFor(profiles, did, domain) {
	const profile = profiles.get(did);
	return Boolean(domain) && profile?.handle === domain && profile.verified !== false;
}

/**
 * Whether a record is written by the organization itself
 * (the author's handle is the record's domain).
 * @param {RepoRecord} record
 * @param {Map<string, Handle>} profiles
 */
export function isOwnRecord(record, profiles) {
	return speaksFor(profiles, record.did, record.rkey);
}

/**
 * When a version was last edited: when the indexer first saw it (seenAt, in the
 * snapshot), else as its author says. A date in the future is not believed (it
 * would keep that version on top for good): such a version counts as undated.
 * @param {RepoRecord} record
 * @param {number} [now]
 */
export function editedAt(record, now = Date.now()) {
	const date = String(record.seenAt || record.value.updatedAt || record.value.createdAt || '');
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
 * @param {Map<string, Handle>} profiles
 */
export function pickVersion(versions, profiles) {
	return versions.find((v) => isOwnRecord(v, profiles)) || byRecent(versions)[0];
}

/**
 * Whether a version was written by a bot (config.bots), or by a new account over
 * someone else's (newAuthor, see indexer/seen.js), and no established person
 * has saved a newer version since: nobody has checked it yet.
 * @param {RepoRecord} version
 * @param {RepoRecord[]} versions
 * @param {string[]} [bots]
 */
export function isUnchecked(version, versions, bots = config.bots) {
	if (!bots.includes(version.did) && !version.newAuthor) return false;
	return !versions.some((v) => v.did !== version.did && !bots.includes(v.did) && !v.newAuthor && editedAt(v) > editedAt(version));
}

/**
 * What to say about an unchecked version (an i18n key): the crawler's, or a new account's.
 * @param {RepoRecord} version
 * @param {string[]} [bots]
 */
export function uncheckedLabel(version, bots = config.bots) {
	return bots.includes(version.did) ? 'company.unchecked' : 'company.unchecked.newAccount';
}

/**
 * What sort of organization it is, when it is one the app knows (config.companyForm.kinds): '' else.
 * @param {unknown} kind
 */
export function kindOf(kind) {
	return typeof kind === 'string' && config.companyForm.kinds.includes(kind) ? kind : '';
}

/** Fields of a company record compared between versions, with their form label. */
export const FIELDS = /** @type {const} */ ([
	['name', 'form.name'],
	['url', 'form.website'],
	['description', 'form.description'],
	['kind', 'form.kind'],
	['tags', 'form.tags'],
	['locations', 'form.locations'],
	['jobBoard', 'form.section.jobs'],
	['links', 'form.links'],
	['contribute', 'form.contribute']
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
 * @param {Map<string, Handle>} profiles
 * @returns {Company}
 */
export function toCompany(versions, profiles) {
	const record = pickVersion(versions, profiles);
	// Anyone can write a version: only what the lexicon allows is shown.
	const v = capRecord(config.collections.company, record.value);
	return {
		key: record.rkey,
		name: v.name || record.rkey,
		url: safeUrl(v.url) || undefined,
		description: v.description,
		kind: kindOf(v.kind),
		tags: v.tags || [],
		locations: v.locations || [],
		jobBoard: v.jobBoard,
		links: (v.links || []).map((/** @type {unknown} */ link) => safeUrl(link)).filter(Boolean),
		contribute: readContribute(v.contribute),
		verified: isOwnRecord(record, profiles),
		// A company's own record is never "the crawler's", even from a bot account.
		unchecked: !isOwnRecord(record, profiles) && isUnchecked(record, versions),
		editedAt: editedAt(record),
		record,
		versions: byRecent(versions)
	};
}

/**
 * The ways to take part an app knows, each with a safe link or a text.
 * @param {unknown} value a record's contribute (already within the lexicon's limits)
 * @returns {Contribution[]}
 */
export function readContribute(value) {
	if (!Array.isArray(value)) return [];
	return value
		.map((c) => ({ kind: config.companyForm.contributeKinds.includes(c?.kind) ? c.kind : '', text: c?.text?.trim() || undefined, url: safeUrl(c?.url) || undefined }))
		.filter((c) => c.kind && (c.text || c.url));
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
		company.kind,
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
 * @typedef {{
 *   name: string,
 *   url: string,
 *   description: string,
 *   kind: string,
 *   tags: string[],
 *   provider: string,
 *   boardId: string,
 *   careersUrl: string,
 *   locations: Location[],
 *   links: string[],
 *   contribute: {kind: string, text: string, url: string}[]
 * }} CompanyForm
 */

/**
 * A company record from form values.
 * @param {CompanyForm} form
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
	if (kindOf(form.kind)) record.kind = form.kind;
	const tags = [...new Set(form.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];
	if (tags.length) record.tags = tags;
	const locations = form.locations.filter((l) => Object.values(l).some((x) => String(x || '').trim()));
	if (locations.length) record.locations = locations;
	if (form.provider && form.boardId.trim()) {
		record.jobBoard = { provider: form.provider, id: form.boardId.trim() };
	} else if (form.careersUrl.trim()) {
		record.jobBoard = { url: withScheme(form.careersUrl) };
	}
	const links = [...new Set(form.links.map((l) => l.trim()).filter(Boolean).map(withScheme))];
	if (links.length) record.links = links;
	const contribute = (form.contribute || [])
		.filter((c) => config.companyForm.contributeKinds.includes(c.kind) && (c.text.trim() || c.url.trim()))
		.map(({ kind, text, url }) => ({ kind, ...(text.trim() && { text: text.trim() }), ...(url.trim() && { url: withScheme(url) }) }));
	if (contribute.length) record.contribute = contribute;
	return record;
}

/**
 * Form values from a company (or empty).
 * @param {Company | null} company
 * @returns {CompanyForm}
 */
export function toForm(company) {
	return {
		name: company?.name || '',
		url: company?.url || '',
		description: company?.description || '',
		kind: company?.kind || '',
		tags: [...(company?.tags || [])],
		provider: company?.jobBoard?.provider || '',
		boardId: company?.jobBoard?.id || '',
		careersUrl: company?.jobBoard?.url || '',
		locations: (company?.locations || []).map((l) => ({ ...l })),
		links: [...(company?.links || [])],
		contribute: (company?.contribute || []).map((c) => ({ kind: c.kind, text: c.text || '', url: c.url || '' }))
	};
}

/**
 * A link as written, with https:// when it has no scheme.
 * @param {string} url
 */
export function withScheme(url) {
	const value = url.trim();
	return value.includes('://') ? value : `https://${value}`;
}
