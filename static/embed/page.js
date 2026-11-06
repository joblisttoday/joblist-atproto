// /embed/?company=example.com&lang=fr&limit=10: the page's address sets the jobs shown.
const params = new URLSearchParams(location.search);
const jobs = document.querySelector('joblist-jobs');
for (const name of ['company', 'lang', 'limit']) {
	const value = params.get(name);
	if (value && jobs) jobs.setAttribute(name, value);
}
if (params.get('lang')) document.documentElement.lang = params.get('lang') || 'en';
