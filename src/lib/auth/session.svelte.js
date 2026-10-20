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
	/** @type {import('@atproto/api').Agent | null} */
	agent: null,
	/** @type {string | null} */
	error: null
});

/** Restore the last session, or finish a sign-in redirect. Call once. */
export async function initSession() {
	try {
		client = await (await auth()).loadClient(clear);
		const result = await client.init();
		if (result) {
			await use(result.session);
			if (result.state) await goto(result.state, { replace: true });
		}
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
	const { Agent } = await import('@atproto/api');
	session.agent = new Agent(oauthSession);
	const profiles = await getProfiles([oauthSession.sub]);
	session.handle = profiles.get(oauthSession.sub)?.handle || oauthSession.sub;
}

function clear() {
	session.did = null;
	session.handle = null;
	session.agent = null;
}
