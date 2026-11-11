<script>
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import { deleteRecord } from '#lib/atproto/write.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { afterDelete } from '#lib/models/company-form.js';
	import { data, handleOf, removeLocal } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Delete the signed-in person's version of a company, once they have read
	 * what it does to the page (a native dialog, "Keep it" by default).
	 * @type {{company: import('#lib/models/company.js').Company}}
	 */
	let { company } = $props();
	const own = $derived(company.versions.find((v) => v.did === session.did));
	const after = $derived(afterDelete(company, session.did || '', data.profiles));
	const handle = $derived('next' in after ? handleOf(after.next.did) : '');
	/** @type {ConfirmDialog | undefined} */
	let confirmer = $state();
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	async function remove() {
		if (!own) return;
		// Said before deleting: once deleted, what remains is another page.
		const { outcome } = after;
		busy = true;
		error = null;
		try {
			await deleteRecord(config.collections.company, company.key);
			removeLocal('company', own.uri);
			if (outcome === 'gone') await goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

{#if own}
	<jl-company-delete>
		<button type="button" onclick={() => confirmer?.ask()} disabled={busy}>
			{busy ? t('company.deleting') : t('company.delete')}
		</button>
		<ConfirmDialog
			bind:this={confirmer}
			title={t(`company.delete.${after.outcome}`, { name: company.name, handle })}
			text={t(`company.delete.${after.outcome}.text`, { name: company.name })}
			keep={t('company.delete.keep')}
			confirm={t('company.delete.confirm')}
			onconfirm={remove}
		/>
		{#if error}<p role="alert">{error}</p>{/if}
	</jl-company-delete>
{/if}

<style>
	jl-company-delete {
		display: contents;
	}
	/* Beside the page's other actions, as small as they are. */
	jl-company-delete > button {
		font-size: var(--font-size-small);
	}
</style>
