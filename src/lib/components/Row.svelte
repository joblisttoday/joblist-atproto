<script>
	import Icon from './Icon.svelte';
	import JobAvatar from './JobAvatar.svelte';

	/**
	 * One thing in a list, the same for every kind (docs/architecture.md: rows and chips):
	 *   [avatar]  title                          [trailing]
	 *             meta · meta · meta  (chip)
	 * The whole row opens it (href, or onclick). avatar: an organization's picture, else its
	 * initial; icon: a list's or a setting's. meta: one muted line. chip: at most one state.
	 * Trailing, one of: count, check (a checkbox), menu (its "…", a snippet: CardMenu), and ›
	 * when it goes somewhere (an action, onclick, has none).
	 * @type {{
	 *   title: string,
	 *   href?: string,
	 *   onclick?: () => void,
	 *   external?: boolean,
	 *   avatar?: {key: string, name: string, src?: string},
	 *   icon?: import('#lib/icons.js').IconName,
	 *   meta?: (string | false | null | undefined)[],
	 *   chip?: {text: string, tone?: 'new' | 'ok' | 'warn'} | null,
	 *   count?: string | number,
	 *   check?: {checked: boolean, disabled?: boolean, onchange: () => void},
	 *   menu?: import('svelte').Snippet
	 * }}
	 */
	let { title, href, onclick, external = false, avatar, icon, meta = [], chip, count, check, menu } = $props();
	const line = $derived(meta.filter(Boolean).join(' · '));
</script>

{#snippet body()}
	{#if avatar}<JobAvatar key={avatar.key} name={avatar.name} src={avatar.src} />{:else if icon}<jl-row-icon><Icon name={icon} /></jl-row-icon>{/if}
	<jl-row-text>
		<strong>{title}</strong>
		{#if line || chip}<small>{#if chip}<jl-chip tone={chip.tone}>{chip.text}</jl-chip>{/if}{line}</small>{/if}
	</jl-row-text>
	{#if count !== undefined}<jl-row-count>{count}</jl-row-count>{/if}
	{#if href && !menu && !check}<Icon name={external ? 'external' : 'next'} />{/if}
{/snippet}

<jl-row>
	{#if check}
		<label>
			<input type="checkbox" checked={check.checked} disabled={check.disabled} onchange={check.onchange} />
			{@render body()}
		</label>
	{:else if href}
		<a {href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{@render body()}</a>
	{:else if onclick}
		<button type="button" {onclick}>{@render body()}</button>
	{:else}
		<div>{@render body()}</div>
	{/if}
	{#if menu}<jl-row-menu>{@render menu()}</jl-row-menu>{/if}
</jl-row>

<style>
	jl-row {
		display: flex;
		align-items: center;
		border-bottom: var(--border);
	}
	jl-row > a,
	jl-row > button,
	jl-row > div,
	jl-row > label {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		flex: 1;
		min-width: 0;
		min-height: var(--tap-size);
		padding: var(--space-s) 0;
		border: 0;
		border-radius: 0;
		background: none;
		color: var(--color-fg);
		font-weight: normal;
		text-align: start;
		text-decoration: none;
	}
	jl-row > a:hover strong,
	jl-row > button:hover strong {
		text-decoration: underline;
	}
	jl-row-text {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	strong {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	small {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0 var(--space-xs);
		color: var(--color-muted);
	}
	jl-row-icon {
		display: grid;
		place-items: center;
		width: var(--avatar-small);
		height: var(--avatar-small);
		border-radius: var(--radius);
		background: var(--color-soft);
	}
	jl-row-count {
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
	}
	jl-row > :global(a > jl-icon:last-child),
	jl-row > :global(button > jl-icon:last-child) {
		color: var(--color-muted);
	}
	input {
		flex: none;
	}
</style>
