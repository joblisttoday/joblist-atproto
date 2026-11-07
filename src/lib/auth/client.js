import { BrowserOAuthClient } from '@atproto/oauth-client-browser';
import config from '#lib/data/config.json';

/** Only what the app writes: its own record types. */
export const SCOPE = ['atproto', ...Object.values(config.collections).map((nsid) => `repo:${nsid}`)].join(' ');

/**
 * Production loads the published client metadata; local development
 * (http://127.0.0.1) uses an atproto loopback client id.
 * @param {(sub: string) => void} onSessionDeleted the account whose session ended
 */
export function loadClient(onSessionDeleted) {
	const { protocol, hostname, port, origin } = window.location;
	const loopback = protocol === 'http:';
	const clientId = loopback
		? `http://localhost?${new URLSearchParams({
				redirect_uri: `http://${hostname === 'localhost' ? '127.0.0.1' : hostname}:${port}/`,
				scope: SCOPE
			})}`
		: `${origin}/client-metadata.json`;
	return BrowserOAuthClient.load({
		clientId,
		handleResolver: config.services.handleResolver,
		onSessionDeleted
	});
}
