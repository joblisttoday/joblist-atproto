<script>
	import Tabs from './Tabs.svelte';
	import tabs from '#lib/data/profile-tabs.json';
	import { companiesBy, postsBy } from '#lib/network/profile.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An account's tabs (src/lib/data/profile-tabs.json), each with how many things it holds.
	 * whenAny: shown only when there is something, or on one's own page (to post the first).
	 * @type {{handle: string, did: string, self: boolean}}
	 */
	let { handle, did, self } = $props();
	/** @type {Record<string, number>} */
	const counts = $derived({ posts: postsBy(did, self).length, companies: companiesBy(did).length });
	const shown = $derived(
		tabs
			.filter((tab) => !tab.whenAny || self || counts[tab.count])
			.map((tab) => ({ path: tab.path, icon: /** @type {import('#lib/icons.js').IconName} */ (tab.icon), label: t(tab.label), count: counts[tab.count] }))
	);
</script>

<Tabs base="/{handle}" label={t('profile.tabs')} tabs={shown} />
