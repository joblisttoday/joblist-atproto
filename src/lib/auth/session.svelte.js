import { goto } from '$app/navigation';
import { getProfiles } from '#lib/atproto/identity.js';
import { nextPath } from '#lib/navigation/next.js';
import { carryDrafts, forgetAll } from '#lib/network/drafts.js';
import { signingIn } from '#lib/navigation/address.js';
import { attachAccount, currentProfile, detachAccount, profiles, profilesKept, removeProfile } from '#lib/profiles/profiles.js';

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
 * Whether there is a session to restore: the sign-in code (large) loads only then, on the
 * way back from signing in, or when the current profile has an account (profiles.js).
 */
async function mayHaveSession() {
	if (signingIn()) return true;
	if (currentProfile().did) return true;
	if (profilesKept()) return false;
	// Neither kept yet (signed in before either was): ask the sign-in store, once.
	const databases = (await indexedDB.databases?.().catch(() => null)) ?? null;
	return !databases || databases.some((db) => db.name === '@atproto-oauth-client');
}

/** Finish a sign-in, or restore the current profile's account. Call once. */
export async function initSession() {
	try {
		if (!(await mayHaveSession())) return;
		client = await (await auth()).loadClient(clear);
		if (signingIn()) {
			const from = currentProfile().id;
			const result = await client.init().catch((err) => {
				// Signing in failed: back where it started, saying why, rather than on the home page.
				session.error = err instanceof Error ? err.message : String(err);
				return null;
			});
			const back = takeBack();
			if (result && 'state' in result) {
				// An account already in another profile opens that profile, with what was being written.
				if (attachAccount(result.session.sub)) {
					carryDrafts(from, currentProfile().id);
					return location.replace(result.state || back || '/');
				}
				await use(result.session);
			}
			if (result?.state || back) await goto(result?.state || back || '/', { replace: true });
			return;
		}
		// Each profile its own account, restored by name (signed in before profiles: the last one).
		const did = currentProfile().did || (profilesKept() ? null : (await client.init().catch(() => null))?.session.sub);
		if (!did) return;
		try {
			await use(await client.restore(did));
		} catch {
			detachAccount(did);
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
	// Back to the page signing in started from (/signin?next=… names it), as it was (after the "#" too).
	const { pathname, search, hash } = window.location;
	const back = pathname === '/signin' ? nextPath(new URLSearchParams(search)) || '/' : pathname + search + hash;
	keepBack(back);
	await client.signIn(handle.trim().replace(/^@/, ''), { scope: SCOPE, state: back });
}

/** Sign out of this profile's account: what was being written goes too, for whoever uses it next. */
export async function signOut() {
	forgetAll();
	if (client && session.did) {
		try {
			await client.revoke(session.did);
		} catch {
			// the local session is cleared either way
		}
	}
	clear();
}

/**
 * A profile gone from this browser, with what it kept, and signed out of its account.
 * @param {string} id
 */
export async function forgetProfile(id) {
	const did = profiles().list.find((p) => p.id === id)?.did;
	if (did) {
		try {
			client ??= await (await auth()).loadClient(clear);
			await client.revoke(did);
		} catch {
			// gone from this browser either way
		}
	}
	removeProfile(id);
}

/** Where signing in started, in this tab: back there even when it fails. */
const BACK = 'joblist.signInBack.v1';
/** @param {string} path */
function keepBack(path) {
	try {
		sessionStorage.setItem(BACK, path);
	} catch {
		// storage blocked: a sign-in that succeeds still comes back
	}
}
function takeBack() {
	try {
		const path = sessionStorage.getItem(BACK);
		sessionStorage.removeItem(BACK);
		// Only a path of this site.
		return path && path.startsWith('/') && !path.startsWith('//') ? path : null;
	} catch {
		return null;
	}
}

/** @param {import('@atproto/oauth-client-browser').OAuthSession} oauthSession */
async function use(oauthSession) {
	session.did = oauthSession.sub;
	const { Agent } = await import('@atproto/api');
	session.agent = new Agent(oauthSession);
	const found = await getProfiles([oauthSession.sub]);
	session.handle = found.get(oauthSession.sub)?.handle || oauthSession.sub;
	session.avatar = found.get(oauthSession.sub)?.avatar || null;
	attachAccount(oauthSession.sub, session.handle);
}

/** @param {string} [ended] the account whose session ended (the client says which) */
function clear(ended) {
	// A session that ended (signed out, expired, revoked): what was written in it is not left for the next person.
	const did = typeof ended === 'string' ? ended : session.did;
	if (did) detachAccount(did);
	// Another profile's account: this one's session stays.
	if (did && session.did && did !== session.did) return;
	if (session.did) forgetAll();
	session.did = null;
	session.handle = null;
	session.avatar = null;
	session.agent = null;
}
