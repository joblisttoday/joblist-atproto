/**
 * The add form, filled in with what was found of an organization (/org/page?url=…&name=…&board=…
 * &description=…&link=…): from its local profile, the add-on.
 * @param {{link: string, website?: string, name?: string, board?: string, description?: string, others?: string[]}} found
 *   link: what it was kept by; website: its own, when known; board: its job board's address;
 *   others: its other links (a Bluesky profile…)
 */
export function suggestAddress({ link, website = '', name = '', board = '', description = '', others = [] }) {
	const params = new URLSearchParams();
	const url = website || link;
	params.set('url', url);
	params.set('name', name);
	if (board) params.set('board', board);
	if (description) params.set('description', description);
	// Its other links, and the link it was kept by when it is not its website or board.
	for (const other of new Set([...others, link])) if (other && other !== url && other !== board) params.append('link', other);
	return `/org/page?${params}`;
}
