<script>
	import config from '#lib/data/config.json';
	import SettingsHeader from '#lib/components/SettingsHeader.svelte';
	import StoryPicture from '#lib/components/StoryPicture.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * About joblist (/about, from Settings and the home): how it works, its four ideas one
	 * after the other, each text beside its picture when there is room; a picture plays once
	 * when it comes into view.
	 */
	const steps = [1, 2, 3, 4];
	let seen = $state(steps.map(() => false));

	/** Shows its picture once it is in view. @param {number} i */
	const inView = (i) => (/** @type {Element} */ node) => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				seen[i] = true;
				observer.disconnect();
			},
			{ threshold: 0.4 }
		);
		observer.observe(node);
		return () => observer.disconnect();
	};
</script>

<svelte:head><title>{t('settings.about')} · {config.name}</title></svelte:head>

<jl-about>
	<SettingsHeader title={t('settings.about')} />
	<p>{t('home.summary')}</p>

	{#each steps as n, i (n)}
		<section aria-labelledby="about-{n}">
			<div>
				<h2 id="about-{n}"><span>{n}</span>{t(`home.step.${n}.title`)}</h2>
				<p>{t(`home.step.${n}.text`)}</p>
			</div>
			<figure {@attach inView(i)}>
				{#if seen[i]}<StoryPicture step={i} />{/if}
			</figure>
		</section>
	{/each}
</jl-about>

<style>
	section {
		display: grid;
		gap: var(--space-m);
		align-items: center;
		margin-top: var(--space-xl);
	}
	h2 {
		margin: 0 0 var(--space-xs);
	}
	h2 span {
		margin-inline-end: var(--space-s);
		color: var(--color-muted);
	}
	h2 + p {
		margin: 0;
	}
	/* Its room kept before it comes, so nothing jumps. */
	jl-about {
		display: block;
		max-width: 60rem;
		margin-inline: auto;
	}
	jl-about > p {
		max-width: var(--reading-width);
	}
	figure {
		width: 100%;
		aspect-ratio: 320 / 200;
		margin: 0;
	}
	/* Its text beside its picture when there is room. */
	@media (min-width: 40rem) {
		section {
			grid-template-columns: 1fr 1fr;
			gap: var(--space-xl);
		}
	}
</style>
