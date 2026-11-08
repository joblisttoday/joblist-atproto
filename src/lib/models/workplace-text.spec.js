import { describe, expect, it } from 'vitest';
import { workplaceFromText } from './workplace-text.js';

describe('workplaceFromText', () => {
	// Phrasings found in real descriptions (Greenhouse boards, November 2026).
	it.each([
		['Compensation Range: $167,200 - $209,000 *This is a remote role JR: 2026-8312 #LI-Remote', 'remote'],
		['This is a full-time, fully remote position. We do expect the successful candidate to come to the office twice a year.', 'remote'],
		['This position is a remote position based out of (locality), with the possibility of becoming a hybrid position.', 'remote'],
		['Location: Remote role based in either California or Oregon. This position is open to remote workers in the following regions', 'remote'],
		['This is a full-time position based out of our Oakland office. Our hybrid work model offers a blend of remote flexibility and in-person collaboration.', 'hybrid'],
		['We work 3 days a week in the office.', 'hybrid'],
		['Location: Wenatchee, WA. This is an onsite role. Shift schedule to be confirmed.', 'onsite'],
		['This role will report to the SVP of Product Strategy and will be an onsite role based in San Diego.', 'onsite'],
		['This is an in-person role based out of our HQ in South San Francisco.', 'onsite'],
		['Please note: this is not a remote position.', 'onsite'],
		['Die Stelle ist vollständig remote möglich.', 'remote'],
		['Wir bieten ein hybrides Arbeitsmodell.', 'hybrid'],
		['Poste en télétravail, avec des rencontres trimestrielles.', 'remote'],
		['Nous proposons un mode hybride (2 jours au bureau).', 'hybrid'],
		['Poste en présentiel à Lyon.', 'onsite'],
		['Trabajo 100% remoto desde España.', 'remote'],
		['Ofrecemos una modalidad híbrida.', 'hybrid'],
		['Modalidad presencial en Madrid.', 'onsite']
	])('%s → %s', (text, expected) => {
		expect(workplaceFromText(text)).toBe(expected);
	});

	// What does not say it clearly stays unknown.
	it.each([
		['Remote Sensing Engineer: you will process satellite data.'],
		['We are a remote-friendly team with an office in Berlin.'],
		['Our customers work remotely and in hybrid teams; our product helps them.'],
		['#LI-Remotely is not a tag'],
		[''],
		[undefined]
	])('%s → unknown', (text) => {
		expect(workplaceFromText(text)).toBe(undefined);
	});
});
