<script>
	import Icon from './Icon.svelte';
	import Author from './Author.svelte';
	import EditTime from './EditTime.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { saveVersion } from '#lib/network/save-version.js';
	import { changedFields, editedAt, isOwnRecord, isUnchecked } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{company: import('#lib/models/company.js').Company}} */
	let { company } = $props();
	/** @type {string | null} */
	let busy = $state(null);
	/** @type {string | null} */
	let error = $state(null);

	/** @param {import('#lib/atproto/records.js').RepoRecord} version */
	async function restore(version) {
		busy = version.uri;
		error = null;
		try {
			await saveVersion(company, version);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = null;
		}
	}
</script>

<jl-company-versions>
	<details>
		<summary id="company-history">{t('company.history')} <small>{t('company.history.count', { count: company.versions.length })}</small></summary>
		<p><small>{t('company.history.help')}</small></p>
		<ol aria-labelledby="company-history">
			{#each company.versions as version (version.uri)}
				{@const current = version.uri === company.record.uri}
				{@const changes = current ? [] : changedFields(version, company.record)}
				<li>
					<jl-version current={current || undefined} unchecked={(!isOwnRecord(version, data.profiles) && isUnchecked(version, company.versions)) || undefined}>
						<p>
							<Author did={version.did} /> · <EditTime datetime={editedAt(version)} />
							{#if current}· <strong>{t('company.version.current')}</strong>{/if}
						</p>
						<small>
							{#if isOwnRecord(version, data.profiles)}<Icon name="verified" /> {t('company.version.own')} · {/if}
							{#if !isOwnRecord(version, data.profiles) && isUnchecked(version, company.versions)}{t('company.unchecked')} · {/if}
							{#if current}{version.value.name}{:else if changes.length}{t('company.version.changes', {
									fields: changes.map((label) => t(label)).join(', ')
								})}{:else}{t('company.version.same')}{/if}
						</small>
						{#if !current && session.did}
							<button type="button" onclick={() => restore(version)} disabled={busy !== null}>
								{busy === version.uri ? t('form.saving') : t('company.restore')}
							</button>
						{/if}
					</jl-version>
				</li>
			{/each}
		</ol>
		{#if error}<p role="alert">{error}</p>{/if}
	</details>
</jl-company-versions>

<style>
	jl-company-versions {
		display: block;
		margin-top: var(--space-xl);
		padding-top: var(--space-m);
		border-top: var(--border);
	}
	summary small {
		font-weight: normal;
	}
	jl-version {
		display: block;
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	jl-version p {
		margin: 0;
	}
	jl-version small {
		display: block;
	}
	jl-version[unchecked] small {
		color: var(--color-warn);
	}
	button {
		margin-top: var(--space-xs);
		font-size: var(--font-size-small);
	}
</style>
