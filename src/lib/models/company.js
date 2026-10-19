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
 * Pick the version shown for a company:
 * the organization's own record, then the viewer's, then the oldest.
 * @param {RepoRecord[]} versions
 * @param {Map<string, {handle: string}>} profiles
 * @param {string | null} viewer
 */
export function pickVersion(versions, profiles, viewer) {
	return (
		versions.find((v) => isOwnRecord(v, profiles)) ||
		versions.find((v) => v.did === viewer) ||
		[...versions].sort((a, b) =>
			String(a.value.createdAt).localeCompare(String(b.value.createdAt))
		)[0]
	);
}

/**
 * @param {RepoRecord[]} versions all records sharing one key
 * @param {Map<string, {handle: string}>} profiles
 * @param {string | null} viewer
 * @returns {Company}
 */
export function toCompany(versions, profiles, viewer) {
	const record = pickVersion(versions, profiles, viewer);
	const v = record.value;
	return {
		key: record.rkey,
		name: v.name || record.rkey,
		url: v.url,
		description: v.description,
		tags: v.tags || [],
		locations: v.locations || [],
		jobBoard: v.jobBoard,
		links: v.links || [],
		verified: isOwnRecord(record, profiles),
		record,
		versions
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
	return jobBoard.url || '';
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
	return company.locations
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
 * A company record from form values.
 * @param {{name: string, url: string, description: string, tags: string, provider: string, boardId: string, careersUrl: string, locations: Location[], links: string}} form
 * @param {string} [createdAt]
 */
export function toRecord(form, createdAt) {
	/** @type {Record<string, any>} */
	const record = {
		$type: 'today.joblist.company',
		name: form.name.trim(),
		createdAt: createdAt || new Date().toISOString()
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
