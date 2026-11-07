/**
 * Resolves once what was just changed on the page is painted: long work started
 * after it does not keep it from showing.
 * @returns {Promise<void>}
 */
export function afterPaint() {
	return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
}
