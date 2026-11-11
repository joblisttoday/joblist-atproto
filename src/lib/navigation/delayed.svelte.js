/**
 * A field that updates its source only once typing pauses, so each keystroke does not
 * search everything again. Changes made to the source elsewhere still show in the field.
 * Call during a component's setup.
 * @param {() => string} read the source's value
 * @param {(value: string) => void} write
 * @param {number} ms
 */
export function delayed(read, write, ms) {
	let value = $state(read());
	let pushed = read();
	$effect(() => {
		const typed = value;
		if (typed === pushed) return;
		const timer = setTimeout(() => {
			pushed = typed;
			write(typed);
		}, ms);
		return () => clearTimeout(timer);
	});
	$effect(() => {
		const outside = read();
		if (outside !== pushed) {
			pushed = outside;
			value = outside;
		}
	});
	return {
		get value() {
			return value;
		},
		set value(next) {
			value = next;
		}
	};
}
