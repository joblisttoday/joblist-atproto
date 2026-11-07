<script>
	import Icon from './Icon.svelte';
	import { tick } from 'svelte';
	import { canAddLink, readLink } from '#lib/models/company-form.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Other pages of the company (Bluesky, LinkedIn, Wikipedia…), one field each:
	 * each says where it goes, or that it is not a link.
	 * @type {{links: string[], tool?: string}}
	 */
	let { links = $bindable(), tool } = $props();
	const id = $props.id();

	async function add() {
		links.push('');
		await tick();
		document.getElementById(`${id}-${links.length - 1}`)?.focus();
	}
</script>

<jl-link-fields>
	<fieldset aria-describedby="{id}-help">
		<legend>{t('form.links')}</legend>
		<small id="{id}-help">{t('form.links.help')}</small>
		<ol>
			{#each links as link, i (i)}
				{@const read = readLink(link)}
				<li>
					<jl-link state={read.state}>
						<label for="{id}-{i}">{t('form.link', { number: i + 1 })}</label>
						<span>
							<input
								id="{id}-{i}"
								name="links"
								toolparamdescription={i === 0 ? tool : undefined}
								bind:value={links[i]}
								type="text"
								inputmode="url"
								autocapitalize="none"
								spellcheck="false"
								placeholder="https://"
								aria-invalid={read.state === 'invalid' || undefined}
								aria-describedby="{id}-{i}-read"
							/>
							<button type="button" onclick={() => links.splice(i, 1)}>
								<Icon name="close" label={t('form.link.remove', { number: i + 1 })} />
							</button>
						</span>
						<small id="{id}-{i}-read" aria-live="polite">
							{#if read.state === 'ok'}<Icon name="added" /> {read.host}{:else if read.state === 'invalid'}{t('form.link.invalid')}{/if}
						</small>
					</jl-link>
				</li>
			{/each}
		</ol>
		{#if canAddLink(links)}
			<button type="button" onclick={add}><Icon name="add" /> {links.length ? t('form.link.another') : t('form.link.add')}</button>
		{/if}
	</fieldset>
</jl-link-fields>

<style>
	label {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	jl-link {
		display: block;
		margin-top: var(--space-s);
	}
	span {
		display: flex;
		gap: var(--space-xs);
	}
	span button {
		flex: none;
		min-width: var(--tap-size);
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-muted);
	}
	jl-link[state='ok'] small {
		color: var(--color-ok);
	}
	jl-link[state='invalid'] small {
		color: var(--color-error);
	}
	li small:empty {
		display: none;
	}
	fieldset > button {
		margin-top: var(--space-s);
		min-height: var(--chip-height);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
</style>
