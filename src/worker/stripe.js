/**
 * Stripe webhook signatures, with Web Crypto only.
 * The Stripe-Signature header is `t=<unix seconds>,v1=<hex HMAC-SHA256>` (v1 may repeat,
 * while secrets are rolled); the signed text is `<t>.<raw body>`.
 * See https://docs.stripe.com/webhooks#verify-manually
 */

const TOLERANCE_SECONDS = 5 * 60;
const encoder = new TextEncoder();

/** @param {string} secret */
function hmacKey(secret) {
	return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

/** @param {string} hex */
function fromHex(hex) {
	if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) return null;
	return new Uint8Array(hex.match(/../g)?.map((byte) => parseInt(byte, 16)) || []);
}

/**
 * Whether the body was sent by Stripe, signed with this secret, less than 5 minutes ago.
 * @param {{secret: string, header: string | null, body: string, now?: number}} input
 */
export async function verifySignature({ secret, header, body, now = Date.now() }) {
	if (!secret || !header) return false;
	const parts = header.split(',').map((p) => p.trim().split('='));
	const t = Number(parts.find(([k]) => k === 't')?.[1]);
	if (!Number.isFinite(t) || Math.abs(now / 1000 - t) > TOLERANCE_SECONDS) return false;
	const key = await hmacKey(secret);
	const data = encoder.encode(`${t}.${body}`);
	for (const [k, value] of parts) {
		const signature = k === 'v1' && fromHex(value || '');
		// crypto.subtle.verify compares in constant time.
		if (signature && (await crypto.subtle.verify('HMAC', key, signature, data))) return true;
	}
	return false;
}

/**
 * A Stripe-Signature header for a body: for tests and local development.
 * @param {{secret: string, body: string, now?: number}} input
 */
export async function signatureHeader({ secret, body, now = Date.now() }) {
	const t = Math.floor(now / 1000);
	const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(`${t}.${body}`));
	const hex = [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
	return `t=${t},v1=${hex}`;
}
