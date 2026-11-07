import { describe, expect, it } from 'vitest';
import { textLinks } from './text-links.js';

describe('textLinks', () => {
	it('keeps text without addresses as it is', () => {
		expect(textLinks('Apply by email.')).toEqual([{ text: 'Apply by email.' }]);
		expect(textLinks('')).toEqual([]);
	});
	it('links web addresses, without the sentence punctuation', () => {
		expect(textLinks('See https://example.org/jobs. Thanks')).toEqual([
			{ text: 'See ' },
			{ text: 'https://example.org/jobs', href: 'https://example.org/jobs' },
			{ text: '. Thanks' }
		]);
	});
	it('leaves a closing bracket it did not open', () => {
		expect(textLinks('(see https://example.org/a)')).toEqual([
			{ text: '(see ' },
			{ text: 'https://example.org/a', href: 'https://example.org/a' },
			{ text: ')' }
		]);
		expect(textLinks('https://en.wikipedia.org/wiki/Go_(language)')[0].href).toBe('https://en.wikipedia.org/wiki/Go_(language)');
	});
	it('links only http and https', () => {
		expect(textLinks('javascript:alert(1) ftp://x.org data:text/html,hi')).toEqual([{ text: 'javascript:alert(1) ftp://x.org data:text/html,hi' }]);
	});
	it('never lets markup through as a link', () => {
		const parts = textLinks('http://a.org/"><script>');
		expect(parts[0]).toEqual({ text: 'http://a.org/', href: 'http://a.org/' });
		expect(parts[1]).toEqual({ text: '"><script>' });
	});
});
