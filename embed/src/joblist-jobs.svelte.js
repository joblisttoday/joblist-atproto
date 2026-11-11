import { mount } from 'svelte';
import JoblistJobs from './JoblistJobs.svelte';

/**
 * <joblist-jobs board="greenhouse:acme" company="acme.org" index="…" query="" where=""
 *   remote="remote" search lang="en" limit="20">: an organization's open jobs on any website,
 * as joblist shows them (JoblistJobs.svelte), in its own shadow root (the page's styles
 * never reach it, its styles never leave it). Its attributes are its properties, followed.
 * Built by scripts/build-embed.js into embed/dist/joblist-jobs.js.
 */
const NAMES = ['board', 'company', 'index', 'lang', 'limit', 'query', 'where', 'remote', 'search'];

class Element extends HTMLElement {
	static observedAttributes = NAMES;
	/** @type {Record<string, any>} */
	props = $state({});

	connectedCallback() {
		if (this.shadowRoot) return;
		for (const name of NAMES) this.read(name);
		mount(JoblistJobs, { target: this.attachShadow({ mode: 'open' }), props: this.props });
	}

	/** @param {string} name */
	attributeChangedCallback(name) {
		this.read(name);
	}

	/** @param {string} name */
	read(name) {
		const value = this.getAttribute(name);
		this.props[name] = name === 'search' ? value !== null : (value ?? '');
	}
}

if (!customElements.get('joblist-jobs')) customElements.define('joblist-jobs', Element);
