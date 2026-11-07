/**
 * What the embeds on other sites need (static/embed/joblist-jobs.js), written
 * next to them at build time: where the company files are, and their words in
 * each language, from the app's own translations.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };
import fr from '../src/lib/i18n/locales/fr.json' with { type: 'json' };

/** @param {Record<string, string>} locale */
const words = (locale) => ({
	title: locale['embed.title'],
	count: locale['embed.count'],
	countOne: locale['embed.count.one'],
	none: locale['embed.none'],
	more: locale['embed.more'],
	by: locale['embed.by'],
	error: locale['embed.error'],
	search: locale['embed.search'],
	follow: locale['landing.follow'],
	followHelp: locale['landing.follow.help'],
	remote: Object.fromEntries(config.jobPost.remote.map((value) => [value, locale[`job.remote.${value}`]]))
});

export function embedSettings() {
	return {
		snapshot: config.snapshot.path,
		dir: config.embed.dir,
		site: config.url,
		shown: config.embed.shown,
		strings: { en: words(en), fr: words(fr) }
	};
}
