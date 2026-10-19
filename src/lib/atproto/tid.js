const ALPHABET = '234567abcdefghijklmnopqrstuvwxyz';
let last = 0;
const clock = Math.floor(Math.random() * 1024);

/**
 * A record key in atproto's TID format (13 base32-sortable characters:
 * microseconds since 1970, then a random clock id), made in the browser so
 * a record can link to its own page before it is written.
 * @param {number} [ms] time in milliseconds
 */
export function tid(ms = Date.now()) {
	// Microseconds, kept increasing within this page.
	last = Math.max(last + 1, ms * 1000);
	let value = (BigInt(last) << 10n) | BigInt(clock);
	let out = '';
	for (let i = 0; i < 13; i++) {
		out = ALPHABET[Number(value & 31n)] + out;
		value >>= 5n;
	}
	return out;
}
