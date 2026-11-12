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
 *   verified: boolean,
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
 * The versions that count for a company: only the organization's own record (its
 * handle is its domain). Nobody else describes an organization in public.
 * @param {RepoRecord[]} versions
 * @param {Map<string, Handle>} profiles
 * @returns {RepoRecord[]} the most recent first
 */
export function countingVersions(versions, profiles) {
	return byRecent(versions.filter((v) => isOwnRecord(v, profiles)));
}

/**
 * The version shown for a company: its own record (undefined when there is none).
 * @param {RepoRecord[]} versions
 * @param {Map<string, Handle>} profiles
 */
export function pickVersion(versions, profiles) {
	return countingVersions(versions, profiles)[0];
}

/**
 * What sort of organization it is, when it is one the app knows (config.companyForm.kinds): '' else.
 * @param {unknown} kind
 */
export function kindOf(kind) {
	return typeof kind === 'string' && config.companyForm.kinds.includes(kind) ? kind : '';
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
		verified: isOwnRecord(record, profiles),
		editedAt: editedAt(record),
		record,
		versions: countingVersions(versions, profiles)
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
 *   links: string[]
 * }} CompanyForm
 */

/**
 * Who writes an organization's page: the organization itself, signed in with its domain
 * as its handle. Anyone else keeps it privately, in their browser.
 * @param {{key: string}} company
 * @param {{did?: string | null, handle?: string | null}} who the signed-in person
 */
export function mayDescribe(company, who) {
	return Boolean(who.handle && who.handle === company.key);
}

/**
 * The provider of an organization that posts its jobs as atproto records from its own
 * account (today.joblist.job, on joblist and any app that reads them): no board to read,
 * no id (the account is the organization's, its handle its domain).
 */
export const ATPROTO = 'atproto';

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
	if (form.provider === ATPROTO) {
		record.jobBoard = { provider: ATPROTO };
	} else if (form.provider && form.boardId.trim()) {
		record.jobBoard = { provider: form.provider, id: form.boardId.trim() };
	} else if (form.careersUrl.trim()) {
		record.jobBoard = { url: withScheme(form.careersUrl) };
	}
	const links = [...new Set(form.links.map((l) => l.trim()).filter(Boolean).map(withScheme))];
	if (links.length) record.links = links;
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
		links: [...(company?.links || [])]
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

/**
 * The organization a signed-in person speaks for: their handle, when it is a domain of
 * its own (not a name on a shared host, like name.bsky.social); '' else.
 * @param {string | null | undefined} handle
 */
export function ownDomain(handle) {
	return handle && !config.hostedHandles.some((host) => handle.endsWith(host)) ? handle : '';
}
