import { onceFor } from './job.js';
import { htmlToText } from './text.js';

/** @param {string} id */
const base = (id) => `https://${encodeURIComponent(id)}.jobs.personio.de`;

/** The board's XML feed, read once per board; '' on any failure. */
const feed = onceFor(async (/** @type {string} */ id) => {
	try {
		const res = await fetch(`${base(id)}/xml?language=en`);
		return res.ok ? await res.text() : '';
	} catch {
		return '';
	}
});

/** @type {import('./index.js').Fetcher} */
export default async function personio(id) {
	return positions(await feed(id)).map(({ fields: p }) => ({
		id: p.id,
		title: p.name || '',
		url: `${base(id)}/job/${p.id}`,
		location: p.office,
		department: p.department,
		published: p.createdAt
	}));
}

/** @type {import('./index.js').Describer} */
export async function describe(id, jobId) {
	const position = positions(await feed(id)).find((p) => p.fields.id === jobId);
	if (!position) return '';
	return [...position.body.matchAll(/<jobDescription>([\s\S]*?)<\/jobDescription>/g)]
		.map(([, part]) => `${text(part, 'name')}\n${htmlToText(text(part, 'value'))}`.trim())
		.join('\n\n');
}

/**
 * The <position> entries of a Personio XML feed: their plain fields, and their body.
 * Text-based, so it runs in browsers and in Node (for the indexer).
 * @param {string} xml
 * @returns {{fields: Record<string, string>, body: string}[]}
 */
function positions(xml) {
	return [...xml.matchAll(/<position>([\s\S]*?)<\/position>/g)].map(([, body]) => {
		/** @type {Record<string, string>} */
		const fields = {};
		for (const [, tag, value] of body.matchAll(/<(\w+)>([^<]*)<\/\1>/g)) fields[tag] = decode(value.trim());
		return { fields, body };
	});
}

/**
 * A tag's text, CDATA or not.
 * @param {string} xml
 * @param {string} tag
 */
function text(xml, tag) {
	const value = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1].trim() || '';
	const cdata = value.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
	return cdata ? cdata[1] : decode(value);
}

/** @param {string} text */
function decode(text) {
	return text
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&amp;/g, '&');
}
