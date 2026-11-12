<script>
	import Row from './Row.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * One of someone's lists of jobs (models/own-lists.js), as every row: its icon, its name,
	 * how many it holds.
	 * @type {{list: import('#lib/models/own-lists.js').OwnList}}
	 */
	let { list } = $props();
	const name = $derived(list.builtin ? t(`marks.${list.id}`) : list.name);
	/** @type {Record<string, import('#lib/icons.js').IconName>} */
	const icons = { saved: 'saved', applied: 'applied', hidden: 'hide' };
</script>

<Row href={list.href} icon={icons[list.id] || 'lists'} title={name} meta={[t('saved.matching', { count: list.count })]} />
