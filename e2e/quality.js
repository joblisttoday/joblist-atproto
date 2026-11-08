/**
 * The UI quality gate of savoir-faire (https://hwww.gitlab.io/savoir/practices/quality-gate/).
 *
 * Copy this file into a project's end-to-end tests, then list its screens:
 *
 *   // e2e/quality.spec.js
 *   import { qualityTests } from './quality.js';
 *   qualityTests([
 *     { name: 'home', path: '/' },
 *     { name: 'search', path: '/search/?q=jazz', touch: 44 },
 *     { name: 'track dialog', open: async (page) => { await page.goto('/'); await page.click('text=Add'); } }
 *   ]);
 *
 * Needs @playwright/test and @axe-core/playwright, and a baseURL in playwright.config.
 * Each screen is checked on a 320px phone and a 1440px desktop for:
 *   - no serious or critical axe violations (WCAG 2.2 AA)
 *   - no horizontal overflow
 *   - touch targets of at least 24px (44px with `touch: 44`), inline links in text exempt
 *   - form fields with at least 16px text (iOS zooms otherwise)
 *   - exactly one h1, a lang, a title, a description and a canonical link
 *   - overlays are native <dialog> elements, not role="dialog" on something else
 *   - no class attributes (framework hash classes such as svelte-xyz are ignored)
 *   - no text forced to uppercase with CSS
 * Turn a check off for one screen with `skip: ['classless']`, and say why next to it.
 *
 * Don't edit a copy: improve it in savoir-faire and copy it again.
 */
import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

export const VIEWPORTS = {
	phone: { width: 320, height: 640 },
	desktop: { width: 1440, height: 900 }
};

/** Class names added by frameworks for scoped styles, not written by us. */
const FRAMEWORK_CLASS = /^(svelte-|s-|astro-|data-v-)/;

/**
 * Every rule broken on the current page, as readable lines.
 * @param {import('@playwright/test').Page} page
 * @param {{ touch?: number, skip?: string[] }} [options]
 * @returns {Promise<string[]>}
 */
export async function qualityProblems(page, { touch = 24, skip = [] } = {}) {
	const problems = await page.evaluate(
		({ touch, skip, frameworkClass }) => {
			const found = [];
			const on = (check) => !skip.includes(check);
			const framework = new RegExp(frameworkClass);
			const root = document.documentElement;
			const name = (el) => {
				const text = el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30) || '';
				return `${el.tagName.toLowerCase()}${text ? ` "${text}"` : ''}`;
			};

			if (on('overflow') && root.scrollWidth > root.clientWidth + 1)
				found.push(`overflow: page is ${root.scrollWidth}px wide in a ${root.clientWidth}px window`);

			if (on('head')) {
				if (!root.lang) found.push('head: <html> has no lang');
				if (!document.title.trim()) found.push('head: no <title>');
				if (!document.querySelector('meta[name="description"][content]')) found.push('head: no meta description');
				if (!document.querySelector('link[rel="canonical"]')) found.push('head: no canonical link');
			}

			if (on('h1')) {
				const count = document.querySelectorAll('h1').length;
				if (count !== 1) found.push(`h1: ${count} on the page, expected 1`);
			}

			if (on('dialogs'))
				for (const el of document.querySelectorAll('[role="dialog"]:not(dialog), [aria-modal]:not(dialog)'))
					found.push(`dialogs: ${name(el)} acts as a dialog; use <dialog>`);

			const walk = (scope, visit) => {
				for (const el of scope.querySelectorAll('*')) {
					visit(el);
					if (el.shadowRoot) walk(el.shadowRoot, visit);
				}
			};
			walk(document, (el) => {
				if (on('classless') && el.closest('body')) {
					const own = [...el.classList].filter((c) => !framework.test(c));
					if (own.length) found.push(`classless: ${name(el)} has class "${own.join(' ')}"`);
				}
				const box = el.getBoundingClientRect();
				const style = getComputedStyle(el);
				// Not shown, or visually hidden until focused (a skip link): nothing to tap.
				if (box.width <= 1 || box.height <= 1 || style.visibility === 'hidden') return;

				if (on('targets') && el.matches('button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button]')) {
					const inline = el.matches('a[href]') && style.display === 'inline';
					if (!inline && (box.width < touch - 0.5 || box.height < touch - 0.5))
						found.push(`targets: ${name(el)} is ${Math.round(box.width)}×${Math.round(box.height)}, under ${touch}px`);
				}
				if (on('inputs') && el.matches('input:not([type=checkbox], [type=radio], [type=hidden], [type=file], [type=range]), textarea, select')) {
					const size = parseFloat(style.fontSize);
					if (size < 16) found.push(`inputs: ${name(el)} has ${size}px text, under 16px`);
				}
				if (on('uppercase') && style.textTransform === 'uppercase' && el.textContent?.trim())
					found.push(`uppercase: ${name(el)} is forced to uppercase`);
			});
			return [...new Set(found)];
		},
		{ touch, skip, frameworkClass: FRAMEWORK_CLASS.source }
	);

	if (!skip.includes('axe')) {
		const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
		for (const violation of axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'))
			problems.push(`axe: ${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.target.join(' ')).join(', ')})`);
	}
	return problems;
}

/**
 * Registers one test per screen and viewport.
 * @param {{ name: string, path?: string, open?: (page: import('@playwright/test').Page) => Promise<void>, touch?: number, skip?: string[] }[]} screens
 */
export function qualityTests(screens) {
	test.describe('UI quality gate', () => {
		for (const screen of screens)
			for (const [viewport, size] of Object.entries(VIEWPORTS))
				test(`${screen.name} (${viewport})`, async ({ page }) => {
					await page.setViewportSize(size);
					if (screen.open) await screen.open(page);
					else await page.goto(screen.path ?? '/');
					await page.waitForLoadState('load');
					expect(await qualityProblems(page, screen)).toEqual([]);
				});
	});
}
