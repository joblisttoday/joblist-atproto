<script>
	import config from '#lib/data/config.json';
	import Icon from './Icon.svelte';
	import ListDelete from './ListDelete.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { handleOf } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What one can do with a list, in one row: its author edits it and answers suggestions;
	 * others suggest a company (signing in first). Sharing, copying and deleting
	 * are in a small menu at the end.
	 * suggesting / reviewing: whether "Suggest a company" / the suggestions are open.
	 * @type {{list: import('#lib/models/list.js').List, pending?: number, suggesting?: boolean, reviewing?: boolean}}
	 */
	let { list, pending = 0, suggesting = $bindable(false), reviewing = $bindable(false) } = $props();
	const id = $props.id();

	let copied = $state(false);
	/** @type {ListDelete | undefined} */
	let deleting = $state();
	const mine = $derived(list.did === session.did);
	const path = $derived(`/${handleOf(list.did)}/${list.rkey}`);
	// Signed out, "Suggest" signs in first and comes back here with it open.
	const signin = $derived(`/signin?${new URLSearchParams({ next: `${path}?suggest` })}`);

	async function share() {
		const url = window.location.origin + window.location.pathname;
		if (navigator.share) {
			await navigator.share({ title: list.name, url }).catch(() => {});
		} else {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), config.layout.copiedMs);
		}
	}

	// The small menu closes, and the dialog says what deleting does.
	function remove() {
		document.getElementById(`${id}-more`)?.hidePopover();
		deleting?.ask();
	}
</script>

<jl-list-actions>
	<menu aria-label={t('list.actions')}>
		{#if mine}
			{#if pending}
				<li>
					<button type="button" aria-pressed={reviewing} onclick={() => (reviewing = !reviewing)}>
						<Icon name="suggestions" /> {t('list.review')} <small>{pending}</small>
					</button>
				</li>
			{/if}
			<li><a href="{path}/edit"><Icon name="edit" /> {t('list.edit')}</a></li>
		{:else if session.did}
			<li>
				<button type="button" aria-pressed={suggesting} onclick={() => (suggesting = !suggesting)}>
					<Icon name="add" /> {t('list.suggest')}
				</button>
			</li>
		{:else if session.ready}
			<li><a href={signin}><Icon name="add" /> {t('list.suggest')}</a></li>
		{/if}
		<li>
			<button type="button" onclick={share} title={copied ? t('list.linkCopied') : t('list.share')}>
				<Icon name={copied ? 'added' : 'share'} label={copied ? t('list.linkCopied') : t('list.share')} />
			</button>
		</li>
		<li>
			<button type="button" popovertarget="{id}-more" title={t('list.more')}><Icon name="more" label={t('list.more')} /></button>
			<menu popover id="{id}-more" aria-label={t('list.more')}>
				<li><a href="/lists/new?copy={encodeURIComponent(list.uri)}"><Icon name="copy" /> {t('list.copy')}</a></li>
				{#if mine}<li><button type="button" onclick={remove}><Icon name="delete" /> {t('list.delete')}</button></li>{/if}
			</menu>
		</li>
	</menu>
	{#if mine}<ListDelete bind:this={deleting} {list} />{/if}
</jl-list-actions>

<style>
	jl-list-actions {
		display: block;
	}
	menu {
		flex-wrap: nowrap;
		gap: var(--space-xs);
		margin: 0;
	}
	menu > li > :is(a, button) {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
		white-space: nowrap;
	}
	/* Icons alone: round. */
	menu > li > button:has(> :global(jl-icon[role='img'])) {
		width: var(--chip-height);
		padding: 0;
	}
	button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	small {
		color: inherit;
		opacity: 0.7;
	}
	/* The small menu: under the actions, at the right of the screen. */
	menu[popover] {
		position: fixed;
		inset: auto;
		top: var(--popover-top);
		right: var(--gutter);
	}
	menu[popover]:not(:popover-open) {
		display: none;
	}
	menu[popover]:popover-open {
		flex-direction: column;
		gap: 0;
		padding: var(--space-xs);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--color-bg);
		color: var(--color-fg);
		box-shadow: var(--shadow);
	}
	menu[popover] > li > :is(a, button) {
		display: flex;
		justify-content: flex-start;
		width: 100%;
		min-height: var(--tap-size);
		border: 0;
		border-radius: var(--radius);
		font-size: var(--font-size);
	}
</style>
