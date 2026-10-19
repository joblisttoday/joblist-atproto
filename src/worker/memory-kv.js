/**
 * An in-memory stand-in for a KV namespace, for tests.
 * @param {number} [now] fixed time for expirations
 * @returns {import('./store.js').KV & {data: Map<string, {value: string, expires?: number}>}}
 */
export function memoryKv(now = Date.now()) {
	/** @type {Map<string, {value: string, expires?: number}>} */
	const data = new Map();
	return {
		data,
		async get(key, options) {
			const entry = data.get(key);
			if (!entry || (entry.expires && entry.expires <= now)) return null;
			return options?.type === 'json' ? JSON.parse(entry.value) : entry.value;
		},
		async put(key, value, options) {
			const expires = options?.expirationTtl ? now + options.expirationTtl * 1000 : undefined;
			data.set(key, { value, expires });
		}
	};
}
