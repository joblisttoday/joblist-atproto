import { describe, expect, it } from 'vitest';
import { htmlToText, unescapeHtml } from './text.js';

describe('htmlToText', () => {
	it('keeps paragraphs and list items, drops markup', () => {
		const html = '<h3>About</h3><p>We build <b>tools</b>&nbsp;&amp; more.</p><ul><li>One</li><li>Two</li></ul><script>x()</script>';
		expect(htmlToText(html)).toBe('About\n\nWe build tools & more.\n\n• One\n• Two');
	});
	it('reads HTML escaped once more', () => {
		expect(htmlToText(unescapeHtml('&lt;p&gt;Hi&lt;/p&gt;'))).toBe('Hi');
	});
});
