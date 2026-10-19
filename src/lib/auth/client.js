import { BrowserOAuthClient } from '@atproto/oauth-client-browser';
import config from '#lib/data/config.json';

/** Only what the app writes: its two record types. */
export const SCOPE = `atproto repo:${config.collections.company} repo:${config.collections.list}`;

/**
 * Production loads the published client metadata; local development
 * (http://127.0.0.1) uses an atproto loopback client id.
 * @param {() => void} onSessionDeleted
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
