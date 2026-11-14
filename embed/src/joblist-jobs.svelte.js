import { mount } from 'svelte';
import JoblistJobs from './JoblistJobs.svelte';

/**
 * <joblist-jobs organization="acme.org" lang="en" limit="20">: an organization's open jobs on any
 * website, from its own atproto account (JoblistJobs.svelte), in its own shadow root (the page's styles
 * never reach it, its styles never leave it). Its attributes are its properties, followed.
 * Built by scripts/build-embed.js into embed/dist/joblist-jobs.js.
 */
const NAMES = ['organization', 'lang', 'limit'];

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
		this.props[name] = value ?? '';
	}
}

if (!customElements.get('joblist-jobs')) customElements.define('joblist-jobs', Element);
