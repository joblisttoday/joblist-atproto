import config from '#lib/data/config.json';

/**
 * Signing in with atproto (OAuth, in the browser), one account at a time: an organization,
 * its domain as its handle. Writes go to its own repository. The OAuth and API libraries are
 * large: they load only when someone signs in, or was signed in here.
 */
const KEY = 'joblist.signedIn';
const BACK = 'joblist.signInBack';
/** Only what joblist writes, as the permission set published with its lexicons. */
export const SCOPE = `atproto include:${config.lexicons.permissionSet}`;

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

/** The way back from signing in: the OAuth answer, after the "#" or the "?". */
const answering = () => /[#?&](state|code|error)=/.test(location.hash + location.search);

async function loadClient() {
	if (client) return client;
	const { BrowserOAuthClient } = await import('@atproto/oauth-client-browser');
	const { protocol, hostname, port, origin } = location;
	// Local development (http://127.0.0.1) uses an atproto loopback client.
	const clientId =
		protocol === 'http:'
			? `http://localhost?${new URLSearchParams({ redirect_uri: `http://${hostname === 'localhost' ? '127.0.0.1' : hostname}:${port}/`, scope: SCOPE })}`
			: `${origin}/client-metadata.json`;
	client = await BrowserOAuthClient.load({ clientId, handleResolver: config.services.handleResolver, onSessionDeleted: forget });
	return client;
}

/** Finish signing in, or restore the account signed in here. Call once. */
export async function initSession() {
	try {
		const signedIn = localStorage.getItem(KEY);
		if (!signedIn && !answering()) return;
		const oauth = await loadClient();
		if (answering()) {
			const result = await oauth.init().catch((err) => ((session.error = err instanceof Error ? err.message : String(err)), null));
			if (result?.session) await use(result.session);
			const back = sessionStorage.getItem(BACK) || (session.handle ? `/${session.handle}` : '/signin');
			sessionStorage.removeItem(BACK);
			const { goto } = await import('$app/navigation');
			await goto(back, { replace: true });
			return;
		}
		if (signedIn) await use(await oauth.restore(signedIn)).catch(() => forget());
	} catch {
		forget();
	} finally {
		session.ready = true;
	}
}

/** @param {import('@atproto/oauth-client-browser').OAuthSession} oauthSession */
async function use(oauthSession) {
	const { Agent } = await import('@atproto/api');
	session.agent = new Agent(oauthSession);
	session.did = oauthSession.sub;
	localStorage.setItem(KEY, oauthSession.sub);
	const { handleOf } = await import('#lib/atproto.js');
	session.handle = await handleOf(oauthSession.sub);
}

function forget() {
	localStorage.removeItem(KEY);
	session.did = null;
	session.handle = null;
	session.agent = null;
}

/**
 * Sign in with a handle (its domain, for an organization): off to its server, then back.
 * @param {string} handle
 * @param {string} [back] where to land after: its own page by default
 */
export async function signIn(handle, back = '') {
	session.error = null;
	if (back) sessionStorage.setItem(BACK, back);
	const oauth = await loadClient();
	await oauth.signIn(handle.trim().replace(/^@/, '').toLowerCase(), { scope: SCOPE });
}

export async function signOut() {
	const did = session.did;
	forget();
	if (did) await (await loadClient()).revoke(did).catch(() => {});
}

/**
 * Write a record in the signed-in account's repository (create or replace).
 * @param {string} collection
 * @param {string} rkey
 * @param {Record<string, any>} record
 */
export async function putRecord(collection, rkey, record) {
	if (!session.agent || !session.did) throw new Error('not signed in');
	await session.agent.com.atproto.repo.putRecord({ repo: session.did, collection, rkey, record });
}

/**
 * @param {string} collection
 * @param {string} rkey
 */
export async function deleteRecord(collection, rkey) {
	if (!session.agent || !session.did) throw new Error('not signed in');
	await session.agent.com.atproto.repo.deleteRecord({ repo: session.did, collection, rkey });
}
