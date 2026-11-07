<script>
	import config from '#lib/data/config.json';
	import { exportFile, importFile } from '#lib/network/job-collections.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Moving collections to another device: a file to download, and to import there
	 * (added to the collections already there; refused whole when anything is wrong).
	 */
	const id = $props.id();
	/** @type {{state: 'imported' | 'error', text: string} | null} */
	let result = $state(null);
	let href = $state('');

	// The file to download follows the collections; each old link is given back.
	$effect(() => {
		const url = URL.createObjectURL(exportFile());
		href = url;
		return () => URL.revokeObjectURL(url);
	});

	/** @param {Event & {currentTarget: HTMLInputElement}} event */
	async function choose(event) {
		const input = event.currentTarget;
		const file = input.files?.[0];
		if (!file) return;
		try {
			if (file.size > config.jobCollections.fileMaxBytes) throw new Error('format');
			importFile(await file.text());
			result = { state: 'imported', text: t('collections.imported') };
		} catch (err) {
			const code = err instanceof Error && ['json', 'format', 'invalid'].includes(err.message) ? err.message : 'format';
			result = { state: 'error', text: t(`collections.error.${code}`) };
		} finally {
			input.value = '';
		}
	}
</script>

<jl-collections-transfer result={result?.state}>
	<p><small>{t('collections.transfer.help')}</small></p>
	<menu><a href={href || undefined} download={config.jobCollections.file}>{t('collections.export')}</a></menu>
	<label for="{id}-file">{t('collections.import')}</label>
	<input id="{id}-file" type="file" accept="application/json,.json" onchange={choose} />
	{#if result}<p role={result.state === 'error' ? 'alert' : 'status'}>{result.text}</p>{/if}
</jl-collections-transfer>

<style>
	jl-collections-transfer {
		display: block;
	}
	label {
		margin-top: var(--space-m);
	}
	jl-collections-transfer[result='imported'] [role='status'] {
		color: var(--color-ok);
	}
</style>
