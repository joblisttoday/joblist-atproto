import { goto } from '$app/navigation';
import { getProfiles } from '#lib/atproto/identity.js';
import { nextPath } from '#lib/navigation/next.js';
import { forgetAll } from '#lib/network/drafts.js';
import { notReached } from '#lib/models/outbox.js';
import { signingIn } from '#lib/navigation/address.js';
import { accounts, accountsKept, addAccount, currentAccount, removeAccount, useAccount } from './accounts.js';

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
	/** Signed in, but its server can't be reached yet (offline): writes wait in the outbox. */
	offline: false,
	/** @type {string | null} */
	error: null
});

/**
 * Whether there is a session to restore: the sign-in code (large) loads only then, on the
 * way back from signing in, or when an account is in use (accounts.js).
 */
async function mayHaveSession() {
	if (signingIn()) return true;
	if (currentAccount()) return true;
	if (accountsKept()) return false;
	// Neither kept yet (signed in before either was): ask the sign-in store, once.
	const databases = (await indexedDB.databases?.().catch(() => null)) ?? null;
	return !databases || databases.some((db) => db.name === '@atproto-oauth-client');
}

/** Finish a sign-in, or restore the account in use. Call once. */
export async function initSession() {
	try {
		if (!(await mayHaveSession())) return;
		client = await (await auth()).loadClient(clear);
		if (signingIn()) {
			const result = await client.init().catch((err) => {
				// Signing in failed: back where it started, saying why, rather than on the home page.
				session.error = err instanceof Error ? err.message : String(err);
				return null;
			});
			const back = takeBack();
			// Another account signed in: added, and the one in use (the others stay signed in).
			if (result && 'state' in result) await use(result.session);
			if (result?.state || back) await goto(result?.state || back || '/', { replace: true });
			return;
		}
		// The account in use, restored by name (signed in before accounts were kept: the last one).
		const did = currentAccount() || (accountsKept() ? null : (await client.init().catch(() => null))?.session.sub);
		if (!did) return;
		await restore(did);
	} catch (err) {
		// Offline before the sign-in code could even start: the account stays, without its server for now.
		const did = currentAccount();
		if (did && notReached(err)) keepOffline(did);
		else session.error = err instanceof Error ? err.message : String(err);
	} finally {
		session.ready = true;
	}
}

/**
 * The account's session, restored. Offline it stays signed in, without its server for now
 * (reconnect() later); only a session its server ended leaves the list.
 * @param {string} did
 */
async function restore(did) {
	try {
		await use(await /** @type {NonNullable<typeof client>} */ (client).restore(did));
	} catch (err) {
		if (!notReached(err)) return removeAccount(did);
		keepOffline(did);
	}
}

/** @param {string} did */
function keepOffline(did) {
	session.did = did;
	session.handle = accounts().list.find((a) => a.did === did)?.handle || did;
	session.offline = true;
}

/** Back online: the session kept while offline is restored (then what waited is sent). */
export async function reconnect() {
	if (!session.offline || !session.did) return;
	try {
		client ??= await (await auth()).loadClient(clear);
		await restore(session.did);
	} catch {
		// still unreachable: tried again when the browser is back online
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

/**
 * Sign out of the account in use: the next one signed in here, if any, is used (the page
 * reloads). What was being written goes, for whoever uses this browser next.
 */
export async function signOut() {
	forgetAll();
	const did = session.did;
	if (client && did) {
		try {
			await client.revoke(did);
		} catch {
			// the local session is cleared either way
		}
	}
	clear();
	if (currentAccount()) location.reload();
}

/**
 * Publish as another account signed in here: the page reloads with it.
 * @param {string} did
 */
export function switchAccount(did) {
	if (did === session.did) return;
	useAccount(did);
	location.reload();
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
	session.offline = false;
	const { Agent } = await import('@atproto/api');
	session.agent = new Agent(oauthSession);
	const found = await getProfiles([oauthSession.sub]);
	session.handle = found.get(oauthSession.sub)?.handle || oauthSession.sub;
	session.avatar = found.get(oauthSession.sub)?.avatar || null;
	addAccount(oauthSession.sub, session.handle);
}

/** @param {string} [ended] the account whose session ended (the client says which) */
function clear(ended) {
	// A session that ended (signed out, expired, revoked): what was written in it is not left for the next person.
	const did = typeof ended === 'string' ? ended : session.did;
	if (did) removeAccount(did);
	// Another account's session ended: the one in use stays.
	if (did && session.did && did !== session.did) return;
	if (session.did) forgetAll();
	session.did = null;
	session.handle = null;
	session.avatar = null;
	session.agent = null;
	session.offline = false;
}
