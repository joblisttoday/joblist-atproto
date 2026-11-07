import { tick } from 'svelte';

/**
 * Which item is now where the one that left was: the same place, or the last one.
 * @param {number} length items now
 * @param {number} index where the item was
 */
export const nearIndex = (length, index) => (length ? Math.min(Math.max(index, 0), length - 1) : -1);

/**
 * After an item was added or removed, the keyboard stays near it (WCAG 2.4.3):
 * on the control of the item now at its place, else on the fallback.
 * @param {() => HTMLElement | null | undefined} list the list, once changed (its items are its `li`)
 * @param {number} index where the item was
 * @param {string | string[]} selectors the control to focus in an item (the first found, in this order)
 * @param {() => HTMLElement | null | undefined} [fallback]
 */
export async function focusNear(list, index, selectors, fallback) {
	await tick();
	const now = list();
	const items = now?.isConnected ? [...now.querySelectorAll(':scope > li')] : [];
	const item = items[nearIndex(items.length, index)];
	const found = [selectors].flat().map((selector) => item?.querySelector(selector)).find(Boolean);
	const target = /** @type {HTMLElement | null | undefined} */ (found) || fallback?.();
	target?.focus();
}
