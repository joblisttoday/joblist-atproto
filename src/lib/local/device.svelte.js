import config from '#lib/data/config.json';

/**
 * This device's profile: one per browser, at /{name}.local, the same view as anyone's
 * page, private. Its name only names it here (never sent): what it follows and saves is
 * this browser's (kept.svelte.js, job-collections.svelte.js).
 */
const KEY = 'joblist.device.v1';

/** A name for the address: lowercase letters, digits and dashes. @param {unknown} name */
export function deviceName(name) {
	const clean = String(name || '')
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 40);
	return clean || config.device.name;
}

function read() {
	try {
		return deviceName(JSON.parse(localStorage.getItem(KEY) || '{}').name);
	} catch {
		return config.device.name;
	}
}

export const device = $state({ name: typeof localStorage === 'undefined' ? config.device.name : read() });

/** Its address. */
export const devicePath = () => `/${device.name}.local`;

/** @param {string} name */
export function renameDevice(name) {
	device.name = deviceName(name);
	try {
		localStorage.setItem(KEY, JSON.stringify({ name: device.name }));
	} catch {
		// kept for this visit only
	}
	return device.name;
}
