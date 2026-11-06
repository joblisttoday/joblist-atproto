import { goto } from '$app/navigation';
import { getProfiles } from '#lib/atproto/identity.js';
import { nextPath } from '#lib/navigation/next.js';

// The OAuth and API libraries are large: load them after the first paint.
const auth = () => import('./client.js');

/** @type {import('@atproto/oauth-client-browser').BrowserOAuthClient | null} */
let client = null;

export const session = $state({
	ready: false,
	/** @type {string | null} */
	did: null,
	/** @type {string | null} */
	handle: null,
	/** Its Bluesky picture. @type {string | null} */
	avatar: null,
	/** @type {import('@atproto/api').Agent | null} */
	agent: null,
	/** @type {string | null} */
	error: null
});

/**
 * Whether this browser has a session to restore: the sign-in code (large) loads only then,
 * or on the way back from signing in. Kept in this browser: the account signed in, or "none".
 */
const KEY = 'joblist.session.v1';
/** @param {string} value */
function remember(value) {
	try {
		localStorage.setItem(KEY, value);
	} catch {
		// storage blocked: the sign-in code loads on each visit
	}
}
async function mayHaveSession() {
	// Back from the sign-in page (its answer is in the address fragment).
	if (/[#&]state=/.test(location.hash) && /[#&](code|error)=/.test(location.hash)) return true;
	let known = null;
	try {
		known = localStorage.getItem(KEY);
	} catch {
		return true;
	}
	if (known) return known !== 'none';
	// Not known yet (a first visit, or signed in before this was kept): ask the sign-in store, once.
	const databases = (await indexedDB.databases?.().catch(() => null)) ?? null;
	if (!databases) return true;
	const stored = databases.some((db) => db.name === '@atproto-oauth-client');
	if (!stored) remember('none');
	return stored;
}

/** Restore the last session, or finish a sign-in redirect. Call once. */
export async function initSession() {
	try {
		if (!(await mayHaveSession())) return;
		client = await (await auth()).loadClient(clear);
		const result = await client.init();
		if (result) {
			await use(result.session);
			if (result.state) await goto(result.state, { replace: true });
		} else remember('none');
	} catch (err) {
		session.error = err instanceof Error ? err.message : String(err);
	} finally {
		session.ready = true;
	}
}

/**
 * Redirects to the user's own server to sign in.
 * @param {string} handle
 */
export async function signIn(handle) {
	const { loadClient, SCOPE } = await auth();
	if (!client) client = await loadClient(clear);
	// Back to the page signing in started from (/signin?next=… names it).
	const { pathname, search } = window.location;
	const back = pathname === '/signin' ? nextPath(new URLSearchParams(search)) || '/' : pathname + search;
	await client.signIn(handle.trim().replace(/^@/, ''), { scope: SCOPE, state: back });
}

export async function signOut() {
	if (client && session.did) {
		try {
			await client.revoke(session.did);
		} catch {
			// the local session is cleared either way
		}
	}
	clear();
}

/** @param {import('@atproto/oauth-client-browser').OAuthSession} oauthSession */
async function use(oauthSession) {
	session.did = oauthSession.sub;
	remember(oauthSession.sub);
	const { Agent } = await import('@atproto/api');
	session.agent = new Agent(oauthSession);
	const profiles = await getProfiles([oauthSession.sub]);
	session.handle = profiles.get(oauthSession.sub)?.handle || oauthSession.sub;
	session.avatar = profiles.get(oauthSession.sub)?.avatar || null;
}

function clear() {
	remember('none');
	session.did = null;
	session.handle = null;
	session.avatar = null;
	session.agent = null;
}
