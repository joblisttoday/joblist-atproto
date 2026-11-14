<script>
	/**
	 * An organization as a pill: its picture (else its initial), its name, its domain; its page.
	 * @type {{domain: string, name?: string, avatar?: string}}
	 */
	let { domain, name = '', avatar = '' } = $props();
	const shown = $derived(name || domain);
</script>

<a href="/{domain}">
	{#if avatar}<img src={avatar} alt="" />{:else}<span aria-hidden="true">{shown.charAt(0).toUpperCase()}</span>{/if}
	<b>{shown}</b>
	{#if shown !== domain}<small>{domain}</small>{/if}
</a>

<style>
	a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-s);
		max-width: 100%;
		min-width: 0;
		min-height: var(--tap-size);
		padding: var(--space-xs) var(--space-m) var(--space-xs) var(--space-xs);
		border: var(--border);
		border-radius: var(--radius-round);
		color: var(--color-fg);
		text-decoration: none;
	}
	a:hover {
		background: var(--color-soft);
	}
	img,
	span {
		display: grid;
		place-items: center;
		flex: none;
		width: 2rem;
		height: 2rem;
		border-radius: var(--radius-round);
		background: var(--color-soft);
		font-weight: var(--font-weight-strong);
		object-fit: cover;
	}
	b,
	small {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	small {
		color: var(--color-muted);
	}
</style>
