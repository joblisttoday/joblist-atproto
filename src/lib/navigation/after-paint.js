/**
 * Resolves once what was just changed on the page is painted: long work started
 * after it does not keep it from showing.
 * @returns {Promise<void>}
 */
export function afterPaint() {
	return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
}

/**
 * Runs once the page has nothing else to do, at the latest after `wait` ms.
 * @param {() => void} run
 * @param {number} wait
 * @returns {() => void} cancels it
 */
export function whenIdle(run, wait) {
	if (typeof requestIdleCallback === 'function') {
		const id = requestIdleCallback(run, { timeout: wait });
		return () => cancelIdleCallback(id);
	}
	const timer = setTimeout(run, wait);
	return () => clearTimeout(timer);
}
