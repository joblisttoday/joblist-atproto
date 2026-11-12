<script>
	import CompanyPage from './CompanyPage.svelte';
	import providers from '#lib/data/providers.json';
	import { prettyId } from '#lib/models/paste.js';
	import { discover } from '#lib/network/discover.js';
	import { suggestAddress } from '#lib/models/suggest.js';
	import { kept } from '#lib/network/kept.svelte.js';
	import { boardOfKept, keyOf } from '#lib/models/kept.js';
	import { foundFor } from '#lib/network/name-search.js';
	import { keep } from '#lib/network/kept.svelte.js';

	/**
	 * An organization joblist does not know yet: the same page as one it knows (CompanyPage),
	 * with what this browser finds of it from its link (network/discover.js): its Bluesky
	 * account, its job board and open jobs (read live, one board), where those jobs are.
	 * Kept in this browser or not, and suggested to joblist with all that was found.
	 * address: what the page's address keeps besides its jobs' search (/explore/organization: #url=…).
	 * @type {{link: string, address?: Record<string, string>}}
	 */
	let { link, address = {} } = $props();
	let found = $state(/** @type {import('#lib/network/discover.js').Found | null} */ (null));
	$effect(() => {
		const asked = link;
		found = null;
		discover(asked).then((f) => asked === link && (found = f));
	});
	// What a name search found of it (Wikidata: its description, its social accounts), kept here.
	let named = $state(/** @type {import('#lib/models/name-search.js').Found | null} */ (null));
	$effect(() => {
		const domain = keyOf(link);
		named = null;
		if (domain) foundFor(domain).then((f) => keyOf(link) === domain && (named = f));
	});
	// A board found by its name (BoardFinder), kept with it when it is followed.
	let picked = $state(/** @type {{provider: string, id: string} | null} */ (null));
	/** @param {{provider: string, id: string}} board */
	function onboard(board) {
		picked = board;
		if (item) keep(item.url, item.name, board);
	}

	// Saved by its link, or by its domain (the board found when it was saved: a website does not answer browsers).
	const item = $derived(kept.list.find((k) => k.url === link) || kept.list.find((k) => keyOf(k.url) && keyOf(k.url) === keyOf(link)));
	const short = $derived(link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''));
	const board = $derived(picked || found?.board || (item ? boardOfKept(item) : undefined) || null);
	const boardHref = $derived(board ? providers.find((p) => p.id === board.provider)?.board.replace('{id}', board.id) || link : '');
	// Its own name first, then what was found; a board's id as a name, else its link.
	const name = $derived(item?.name || found?.bluesky?.name || named?.name || found?.boardName || (board ? prettyId(board.id) : '') || found?.key || short);
	const website = $derived(found?.key ? `https://${found.key}` : '');
	const bluesky = $derived(found?.bluesky ? `https://bsky.app/profile/${found.bluesky.handle}` : '');

	/** The add form, filled in with what was found. */
	const suggest = $derived(
		suggestAddress({ link, website, name: name === short ? '' : name, board: boardHref, description: found?.bluesky?.description, others: bluesky ? [bluesky] : [] })
	);

	/** It, as joblist's organizations are (models/company.js), from what was found. */
	const company = $derived(
		/** @type {import('#lib/models/company.js').Company} */ (
			/** @type {unknown} */ ({
				key: found?.key || (board ? `${board.provider}-${board.id}` : short),
				name,
				url: website,
				description: found?.bluesky?.description || named?.description || '',
				tags: [],
				locations: [],
				links: [...(bluesky ? [bluesky] : []), ...(named?.socials || []).map((s) => s.href).filter((h) => h !== bluesky)],
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

{#key `${found?.key}:${picked?.id}:${Boolean(named)}`}
	<CompanyPage {company} {local} {address} onboard={board ? undefined : onboard} />
{/key}
