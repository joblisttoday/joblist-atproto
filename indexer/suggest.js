/**
 * Companies people point at but nobody has described yet:
 * keys used in lists or job records without a company record.
 * Anyone can describe one in a tap; that record is the human check.
 * @param {import('../src/lib/models/company.js').Company[]} companies
 * @param {Record<string, import('../src/lib/atproto/records.js').RepoRecord[]>} records
 */
export function suggest(companies, records) {
	const known = new Set(companies.map((c) => c.key));
	/** @type {Map<string, {key: string, mentions: number}>} */
	const missing = new Map();
	const mention = (/** @type {string} */ key) => {
		if (!key || known.has(key)) return;
		const entry = missing.get(key) || { key, mentions: 0 };
		entry.mentions++;
		missing.set(key, entry);
	};
	for (const list of records.list) for (const key of list.value?.companies || []) mention(key);
	for (const job of records.job) mention(job.value?.company);
	return [...missing.values()].sort((a, b) => b.mentions - a.mentions);
}
