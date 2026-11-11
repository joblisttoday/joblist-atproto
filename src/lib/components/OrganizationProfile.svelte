<script>
	import CompanyPage from './CompanyPage.svelte';
	import providers from '#lib/data/providers.json';
	import { prettyId } from '#lib/models/paste.js';
	import { discover } from '#lib/network/discover.js';
	import { kept } from '#lib/network/kept.svelte.js';

	/**
	 * An organization joblist does not know yet: the same page as one it knows (CompanyPage),
	 * with what this browser finds of it from its link (network/discover.js): its Bluesky
	 * account, its job board and open jobs (read live, one board), where those jobs are.
	 * Kept in this browser or not, and suggested to joblist with all that was found.
	 * address: what the page's address keeps besides its jobs' search (/me/organization: #url=…).
	 * @type {{link: string, address?: Record<string, string>}}
	 */
	let { link, address = {} } = $props();
	let found = $state(/** @type {import('#lib/network/discover.js').Found | null} */ (null));
	$effect(() => {
		const asked = link;
		found = null;
		discover(asked).then((f) => asked === link && (found = f));
	});

	const item = $derived(kept.list.find((k) => k.url === link));
	const short = $derived(link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''));
	const board = $derived(found?.board || null);
	const boardHref = $derived(board ? providers.find((p) => p.id === board.provider)?.board.replace('{id}', board.id) || link : '');
	// Its own name first, then what was found; a board's id as a name, else its link.
	const name = $derived(item?.name || found?.bluesky?.name || found?.boardName || (board ? prettyId(board.id) : '') || found?.key || short);
	const website = $derived(found?.key ? `https://${found.key}` : '');
	const bluesky = $derived(found?.bluesky ? `https://bsky.app/profile/${found.bluesky.handle}` : '');

	/** The add form, filled in with what was found. */
	const suggest = $derived.by(() => {
		const params = new URLSearchParams();
		const url = website || link;
		params.set('url', url);
		params.set('name', name === short ? '' : name);
		if (boardHref) params.set('board', boardHref);
		if (found?.bluesky?.description) params.set('description', found.bluesky.description);
		// Its other links: its Bluesky profile, and the kept link when it is not its website or board.
		for (const other of new Set([bluesky, link])) if (other && other !== url && other !== boardHref) params.append('link', other);
		return `/add?${params}`;
	});

	/** It, as joblist's organizations are (models/company.js), from what was found. */
	const company = $derived(
		/** @type {import('#lib/models/company.js').Company} */ (
			/** @type {unknown} */ ({
				key: found?.key || (board ? `${board.provider}-${board.id}` : short),
				name,
				url: website,
				description: found?.bluesky?.description || '',
				tags: [],
				locations: [],
				links: bluesky ? [bluesky] : [],
				jobBoard: board || undefined
			})
		)
	);
	const local = $derived({
		link,
		suggest,
		account: found?.bluesky ? { handle: found.bluesky.handle, avatar: found.bluesky.avatar, followers: found.bluesky.followers } : undefined
	});
</script>

<svelte:head><title>{name}</title></svelte:head>

{#key found}
	<CompanyPage {company} {local} {address} />
{/key}
