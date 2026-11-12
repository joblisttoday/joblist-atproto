/**
 * Explore is two pages, the same view (ExploreTabs): /companies (the organizations followed,
 * by tag) and /jobs (their jobs, and your lists of jobs). Its tab opens the one last used.
 */
export const exploreTab = $state({ href: '/jobs' });

/** Which of the two a path is in, '' for neither. @param {string} path */
export function exploreOf(path) {
	if (path === '/companies' || path.startsWith('/companies/')) return '/companies';
	if (path === '/jobs' || path.startsWith('/jobs/')) return '/jobs';
	return '';
}
