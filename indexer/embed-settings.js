/**
 * What the embed on other sites needs (embed/src/JoblistJobs.svelte), built into it by
 * scripts/build-embed.js: where an index keeps the organizations' files, joblist's
 * address, and its words in each language, from the app's own translations.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };
import fr from '../src/lib/i18n/locales/fr.json' with { type: 'json' };
import de from '../src/lib/i18n/locales/de.json' with { type: 'json' };
import es from '../src/lib/i18n/locales/es.json' with { type: 'json' };

/** The embed's texts: the keys its cards and itself show. @param {Record<string, string>} locale */
const words = (locale) => Object.fromEntries(Object.entries(locale).filter(([key]) => key.startsWith('job.') || key.startsWith('embed.')));

export function embedSettings() {
	return {
		snapshot: config.snapshot.path,
		dir: config.embed.dir,
		site: config.url,
		shown: config.embed.shown,
		strings: { en: words(en), fr: words(fr), de: words(de), es: words(es) }
	};
}
