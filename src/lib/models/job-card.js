import config from '#lib/data/config.json' with { type: 'json' };
import { ago } from '#lib/i18n/dates.js';
import { isOlder, offerPlaces, time, workplace } from './job.js';
import { payAmount } from './salary.js';

/**
 * What a job's card says, the same on joblist and in the embed on other sites (JobCard.svelte):
 * where and for which team on one line; how (remote, hybrid…, unless the place says it), how
 * much (when its board says) and when as chips; whether it has been listed for long.
 * @typedef {{line: string, place: string, pay: string, age: string, older: boolean}} Facts
 * @param {import('#lib/ats/job.js').Job} job
 * @param {{t: (key: string, vars?: Record<string, string | number>) => string, locale: string, where?: string}} words
 *   where: how it is worked, when known otherwise (its description, read in full)
 * @returns {Facts}
 */
export function jobFacts(job, { t, locale, where = workplace(job) }) {
	const how = where ? t(`job.remote.${where}`) : '';
	// The work place, unless the location already says it ("Remote - USA").
	const place = how && !(job.location || '').toLowerCase().includes(how.toLowerCase()) ? how : '';
	// The same offer at several places: the first ones, then how many more.
	const places = offerPlaces(job);
	const most = config.jobs.placesShown;
	const location = places.length > most ? `${places.slice(0, most).join('; ')} ${t('job.places.more', { count: places.length - most })}` : places.join('; ');
	return {
		line: [location, job.department].filter(Boolean).join(' · '),
		place,
		pay: job.salary ? t(`job.salary.${job.salary.period}`, { amount: payAmount(job.salary, locale) }) : '',
		age: ago(time(job.published), locale),
		older: isOlder(job)
	};
}
