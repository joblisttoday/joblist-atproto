//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = [
	{
		id: "ashby",
		name: "Ashby",
		board: "https://jobs.ashbyhq.com/{id}"
	},
	{
		id: "greenhouse",
		name: "Greenhouse",
		board: "https://job-boards.greenhouse.io/{id}"
	},
	{
		id: "lever",
		name: "Lever",
		board: "https://jobs.lever.co/{id}"
	},
	{
		id: "personio",
		name: "Personio",
		board: "https://{id}.jobs.personio.de"
	},
	{
		id: "recruitee",
		name: "Recruitee",
		board: "https://{id}.recruitee.com"
	},
	{
		id: "rippling",
		name: "Rippling",
		board: "https://ats.rippling.com/{id}/jobs"
	},
	{
		id: "smartrecruiters",
		name: "SmartRecruiters",
		board: "https://jobs.smartrecruiters.com/{id}"
	},
	{
		id: "workable",
		name: "Workable",
		board: "https://apply.workable.com/{id}"
	}
], r = /* @__PURE__ */ new Set([
	"",
	"api",
	"app",
	"www",
	"embed",
	"v0",
	"v1",
	"jobs",
	"job",
	"static",
	"assets",
	"careers",
	"login",
	"signup",
	"help"
]), i = [
	{
		provider: "greenhouse",
		host: /^boards-api\.greenhouse\.io$/,
		from: /^\/v1\/boards\/([^/?#]+)/
	},
	{
		provider: "ashby",
		host: /^api\.ashbyhq\.com$/,
		from: /^\/posting-api\/job-board\/([^/?#]+)/
	},
	{
		provider: "lever",
		host: /^api\.(eu\.)?lever\.co$/,
		from: /^\/v0\/postings\/([^/?#]+)/
	},
	{
		provider: "workable",
		host: /^apply\.workable\.com$/,
		from: /^\/api\/v\d+\/(?:widget\/)?accounts\/([^/?#]+)/
	},
	{
		provider: "smartrecruiters",
		host: /^api\.smartrecruiters\.com$/,
		from: /^\/v1\/companies\/([^/?#]+)/
	},
	{
		provider: "rippling",
		host: /^api\.rippling\.com$/,
		from: /^\/platform\/api\/ats\/v\d+\/board\/([^/?#]+)/
	},
	{
		provider: "greenhouse",
		host: /^(job-)?boards(\.eu)?\.greenhouse\.io$/,
		from: "path"
	},
	{
		provider: "lever",
		host: /^jobs\.lever\.co$/,
		from: "path"
	},
	{
		provider: "ashby",
		host: /^jobs\.ashbyhq\.com$/,
		from: "path"
	},
	{
		provider: "workable",
		host: /^apply\.workable\.com$/,
		from: "path"
	},
	{
		provider: "workable",
		host: /^[a-z0-9-]+\.workable\.com$/,
		from: "subdomain"
	},
	{
		provider: "personio",
		host: /^[a-z0-9-]+\.jobs\.personio\.(de|com)$/,
		from: "subdomain"
	},
	{
		provider: "recruitee",
		host: /^[a-z0-9-]+\.recruitee\.com$/,
		from: "subdomain"
	},
	{
		provider: "smartrecruiters",
		host: /^(jobs|careers)\.smartrecruiters\.com$/,
		from: "path"
	},
	{
		provider: "rippling",
		host: /^ats\.rippling\.com$/,
		from: "path"
	}
];
function a(e) {
	let t;
	try {
		t = new URL(e.startsWith("//") ? `https:${e}` : e);
	} catch {
		return null;
	}
	let n = t.hostname.toLowerCase(), a = i.find((e) => e.host.test(n) && (!(e.from instanceof RegExp) || e.from.test(t.pathname)));
	if (!a) return null;
	let o = t.searchParams.get("for");
	if (a.provider === "greenhouse" && o) return {
		provider: "greenhouse",
		id: o
	};
	let s = a.from instanceof RegExp ? decodeURIComponent(t.pathname.match(a.from)?.[1] || "") : a.from === "subdomain" ? n.split(".")[0] : decodeURIComponent(t.pathname.split("/").filter(Boolean)[0] || "");
	return r.has(s.toLowerCase()) ? null : {
		provider: a.provider,
		id: s
	};
}
//#endregion
//#region src/lib/models/url.js
function o(e, { email: t = !1 } = {}) {
	let n = String(e ?? "").trim();
	if (s.test(n)) return n;
	try {
		let { protocol: e } = new URL(n);
		return e === "https:" || e === "http:" || t && e === "mailto:" ? n : "";
	} catch {
		return "";
	}
}
var s = /^https?:\/\/[a-z0-9.-]+(?::\d+)?(?:[/?#][^\s"'<>\\]*)?$/i;
//#endregion
//#region src/lib/ats/job.js
async function c(e) {
	try {
		let t = await fetch(e, { headers: { accept: "application/json" } });
		return t.ok ? await t.json() : null;
	} catch {
		return null;
	}
}
function l(...e) {
	return e.filter(Boolean).join(", ");
}
function u(e) {
	let t = String(e || "").toLowerCase().replace(/[^a-z]/g, "");
	if (t === "remote") return "remote";
	if (t === "hybrid") return "hybrid";
	if (t === "onsite" || t === "inoffice" || t === "office") return "onsite";
}
function d(e) {
	let t = /* @__PURE__ */ new Map();
	return (n) => (t.has(n) || t.set(n, e(n)), t.get(n));
}
//#endregion
//#region src/lib/ats/salary.js
var f = [
	"year",
	"month",
	"week",
	"day",
	"hour"
];
function p(e) {
	let t = Number(typeof e == "string" ? e.replace(/[\s,]/g, "") : e);
	return e !== null && e !== "" && Number.isFinite(t) && t > 0 ? t : void 0;
}
function m({ min: e, max: t, currency: n, period: r }) {
	let i = p(e), a = p(t), o = String(n || "").toUpperCase(), s = String(r || "").toLowerCase();
	if (!i && !a || !/^[A-Z]{3}$/.test(o) || !f.includes(s)) return;
	i && a && i > a && ([i, a] = [a, i]);
	let c = {
		currency: o,
		period: s
	};
	return i && (c.min = i), a && (c.max = a), c;
}
function h(e) {
	let t = e.filter(Boolean), [n] = t;
	if (!n) return;
	let r = t.filter((e) => e.currency === n.currency && e.period === n.period), i = r.map((e) => e.min ?? e.max ?? 0), a = r.map((e) => e.max ?? e.min ?? 0), o = Math.min(...i), s = Math.max(...a);
	return {
		currency: n.currency,
		period: n.period,
		...o ? { min: o } : {},
		...s && s !== o ? { max: s } : {}
	};
}
function g(e) {
	let t = String(e || "").toLowerCase();
	if (!/bi-?week|^\s*([2-9]|\d{2,})\s/.test(t)) {
		if (/hour/.test(t)) return "hour";
		if (/day|daily/.test(t)) return "day";
		if (/week/.test(t)) return "week";
		if (/month/.test(t)) return "month";
		if (/year|annual|annum/.test(t)) return "year";
	}
}
//#endregion
//#region src/lib/ats/ashby.js
var _ = /* @__PURE__ */ t({
	default: () => v,
	describe: () => x
});
async function v(e) {
	return ((await b(e))?.jobs || []).filter((e) => e.isListed !== !1).map((e) => ({
		id: e.id,
		title: e.title,
		url: e.jobUrl,
		location: [e.location, ...(e.secondaryLocations || []).map((e) => e.location)].filter(Boolean).join(", "),
		department: e.department,
		published: e.publishedAt,
		remote: u(e.workplaceType) || (e.isRemote ? "remote" : void 0),
		salary: y(e)
	}));
}
function y(e) {
	return e.shouldDisplayCompensationOnJobPostings ? h((e.compensation?.summaryComponents || []).filter((e) => e.compensationType === "Salary").map((e) => m({
		min: e.minValue,
		max: e.maxValue,
		currency: e.currencyCode,
		period: g(e.interval)
	}))) : void 0;
}
var b = d((e) => c(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(e)}?includeCompensation=true`));
async function x(e, t) {
	return (await b(e))?.jobs?.find((e) => e.id === t)?.descriptionPlain || "";
}
//#endregion
//#region src/lib/ats/text.js
function S(e) {
	return T(String(e || "").replace(/<(script|style)[\s\S]*?<\/\1>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<li[^>]*>/gi, "\n• ").replace(/<\/(p|div|h[1-6]|ul|ol|section|blockquote|tr)>/gi, "\n\n").replace(/<(p|div|h[1-6]|ul|ol|section|blockquote|tr)[^>]*>/gi, "\n\n").replace(/<[^>]+>/g, "")).replace(/[ \t ]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function C(e) {
	return T(String(e || ""));
}
var w = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'",
	nbsp: "\xA0",
	rsquo: "’",
	lsquo: "‘",
	rdquo: "”",
	ldquo: "“",
	ndash: "–",
	mdash: "—",
	hellip: "…",
	bull: "•",
	euro: "€"
};
function T(e) {
	return e.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (e, t) => {
		if (t[0] === "#") {
			let n = t[1].toLowerCase() === "x" ? parseInt(t.slice(2), 16) : Number(t.slice(1));
			return Number.isFinite(n) && n > 0 && n < 1114112 ? String.fromCodePoint(n) : e;
		}
		return w[t.toLowerCase()] ?? e;
	});
}
//#endregion
//#region src/lib/ats/greenhouse.js
var E = /* @__PURE__ */ t({
	default: () => D,
	describe: () => ee,
	payRange: () => k
});
async function D(e) {
	return ((await c(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(e)}/jobs?pay_transparency=true`))?.jobs || []).map((e) => ({
		id: String(e.id),
		title: e.title,
		url: e.absolute_url,
		location: e.location?.name,
		published: e.first_published || e.updated_at,
		salary: h((e.pay_input_ranges || []).map(k))
	}));
}
var O = /variable|bonus|commission|equity/i;
function k(e) {
	if (O.test(e?.title || "")) return;
	let t = `${e.title || ""} ${S(e.blurb)}`, n = Math.max(Number(e.min_cents) || 0, Number(e.max_cents) || 0) / 100, r = /\bhour(ly)?\b/i.test(t) && n < 1e3, i = /\bmonth(ly)?\b/i.test(t) && !/\bannual|\byear/i.test(t), a = r ? "hour" : i ? "month" : n >= 1e3 ? "year" : "";
	return m({
		min: Number(e.min_cents) / 100,
		max: Number(e.max_cents) / 100,
		currency: e.currency_type,
		period: a
	});
}
async function ee(e, t) {
	return S(C((await c(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(e)}/jobs/${encodeURIComponent(t)}`))?.content));
}
//#endregion
//#region src/lib/ats/lever.js
var A = /* @__PURE__ */ t({
	default: () => te,
	describe: () => ne
});
async function te(e) {
	return (await c(`https://api.lever.co/v0/postings/${encodeURIComponent(e)}?mode=json`) || []).map((e) => ({
		id: e.id,
		title: e.text,
		url: e.hostedUrl,
		location: (e.categories?.allLocations || [e.categories?.location]).filter(Boolean).join(", "),
		department: e.categories?.team || e.categories?.department,
		published: e.createdAt ? new Date(e.createdAt).toISOString() : void 0,
		remote: u(e.workplaceType),
		salary: e.salaryRange ? m({
			...e.salaryRange,
			period: g(e.salaryRange.interval)
		}) : void 0
	}));
}
async function ne(e, t) {
	let n = await c(`https://api.lever.co/v0/postings/${encodeURIComponent(e)}/${encodeURIComponent(t)}`);
	if (!n) return "";
	let r = (n.lists || []).map((e) => `${e.text}\n${S(e.content)}`);
	return [
		n.descriptionPlain,
		...r,
		n.additionalPlain
	].filter(Boolean).join("\n\n").trim();
}
//#endregion
//#region src/lib/ats/personio.js
var re = /* @__PURE__ */ t({
	default: () => ie,
	describe: () => ae
}), j = (e) => `https://${encodeURIComponent(e)}.jobs.personio.de`, M = d(async (e) => {
	try {
		let t = await fetch(`${j(e)}/xml?language=en`);
		return t.ok ? await t.text() : "";
	} catch {
		return "";
	}
});
async function ie(e) {
	return N(await M(e)).map(({ fields: t }) => ({
		id: t.id,
		title: t.name || "",
		url: `${j(e)}/job/${t.id}`,
		location: t.office,
		department: t.department,
		published: t.createdAt
	}));
}
async function ae(e, t) {
	let n = N(await M(e)).find((e) => e.fields.id === t);
	return n ? [...n.body.matchAll(/<jobDescription>([\s\S]*?)<\/jobDescription>/g)].map(([, e]) => `${P(e, "name")}\n${S(P(e, "value"))}`.trim()).join("\n\n") : "";
}
function N(e) {
	return [...e.matchAll(/<position>([\s\S]*?)<\/position>/g)].map(([, e]) => {
		let t = {};
		for (let [, n, r] of e.matchAll(/<(\w+)>([^<]*)<\/\1>/g)) t[n] = F(r.trim());
		return {
			fields: t,
			body: e
		};
	});
}
function P(e, t) {
	let n = e.match(RegExp(`<${t}>([\\s\\S]*?)</${t}>`))?.[1].trim() || "", r = n.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
	return r ? r[1] : F(n);
}
function F(e) {
	return e.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&");
}
//#endregion
//#region src/lib/ats/recruitee.js
var oe = /* @__PURE__ */ t({
	default: () => se,
	describe: () => L
});
async function se(e) {
	return ((await c(`https://${encodeURIComponent(e)}.recruitee.com/api/offers`))?.offers || []).map((e) => ({
		id: String(e.id),
		title: e.title,
		url: e.careers_url,
		location: e.location || l(e.city, e.country),
		department: e.department,
		published: e.published_at,
		remote: e.remote ? "remote" : e.hybrid ? "hybrid" : e.on_site ? "onsite" : void 0,
		salary: e.salary ? m({
			...e.salary,
			period: g(e.salary.period)
		}) : void 0
	}));
}
var I = d((e) => c(`https://${encodeURIComponent(e)}.recruitee.com/api/offers`));
async function L(e, t) {
	let n = (await I(e))?.offers?.find((e) => String(e.id) === t);
	return n ? S(`${n.description || ""}${n.requirements || ""}`) : "";
}
//#endregion
//#region src/lib/ats/rippling.js
var R = /* @__PURE__ */ t({
	default: () => z,
	describe: () => B
});
async function z(e) {
	let t = [];
	for (let n = 0; n < 20; n++) {
		let r = await c(`https://api.rippling.com/platform/api/ats/v2/board/${encodeURIComponent(e)}/jobs?page=${n}`);
		if (t.push(...r?.items || []), !r || n + 1 >= (r.totalPages || 0)) break;
	}
	return t.map((e) => ({
		id: e.id,
		title: e.name,
		url: e.url,
		location: (e.locations || []).map((e) => e.name).join(", "),
		department: e.department?.name,
		remote: u(e.locations?.[0]?.workplaceType)
	}));
}
async function B(e, t) {
	let n = await c(`https://api.rippling.com/platform/api/ats/v2/board/${encodeURIComponent(e)}/jobs/${encodeURIComponent(t)}`);
	return S(`${n?.description?.role || ""}${n?.description?.company || ""}`);
}
var V = {
	userAgent: "joblist.today (+https://joblist.today/llms.txt)",
	name: "joblist",
	url: "https://joblist.today",
	source: "https://github.com/joblisttoday/joblist-atproto",
	shareImage: {
		path: "/og.png",
		width: 1200,
		height: 630
	},
	collections: {
		company: "today.joblist.company",
		list: "today.joblist.list",
		job: "today.joblist.job",
		suggestion: "today.joblist.suggestion"
	},
	bots: ["did:plc:jqaucxlucukeif3bltpuc7zx"],
	lexicons: {
		dir: "lexicons",
		did: "did:plc:jqaucxlucukeif3bltpuc7zx",
		permissionSet: "today.joblist.authFull"
	},
	services: {
		relay: "https://relay1.us-east.bsky.network",
		relayFallbacks: ["https://relay1.us-west.bsky.network"],
		appview: "https://public.api.bsky.app",
		plc: "https://plc.directory",
		handleResolver: "https://public.api.bsky.app",
		placeSearch: "https://photon.komoot.io/api/"
	},
	layout: {
		wide: "(min-width: 64rem)",
		dragThreshold: 6,
		finePointer: "(hover: hover) and (pointer: fine)",
		sheetPeekBelow: .3,
		sheetFullAbove: .72,
		copiedMs: 3e3,
		bare: ["/jobs", "/companies"],
		explore: ["/jobs", "/companies"]
	},
	map: {
		style: "https://tiles.openfreemap.org/styles/positron",
		styleDark: "https://tiles.openfreemap.org/styles/dark",
		projection: "globe",
		clusterRadius: 40,
		clusterMaxZoom: 13,
		nearZoom: 11,
		selectZoom: 12,
		globeSizePx: 320,
		globeMinZoom: 1,
		globeCenter: [10, 30],
		globeSpan: 90,
		frameDelayMs: 600,
		loadWaitMs: 3e3,
		center: [13.405, 52.52],
		zoom: 2,
		maxZoom: 13,
		padding: 40,
		pointRadius: 6,
		pointStroke: 2,
		popupMax: 8,
		placeMax: 500,
		focus: {
			cellDeg: .5,
			km: 40,
			share: .5
		},
		font: ["Noto Sans Regular"],
		hitRadius: 22,
		areaMinZoom: 4
	},
	limits: {
		concurrency: 6,
		jobsConcurrency: 6,
		liveBoards: 20,
		pagesPerRepo: 100,
		indexerConcurrency: 8,
		boardPageSize: 100,
		jobsPerBoard: 2e3,
		perAccount: {
			company: 200,
			list: 50,
			job: 50,
			suggestion: 200
		},
		boardsPerAccount: 100,
		boards: 3e3
	},
	locales: [
		"en",
		"fr",
		"de",
		"es"
	],
	defaultLocale: "en",
	placeSearch: {
		limit: 6,
		minLength: 2,
		delayMs: 250,
		languages: [
			"en",
			"fr",
			"de"
		],
		layers: [
			"city",
			"locality",
			"district",
			"county",
			"state",
			"country"
		]
	},
	hostedHandles: [".bsky.social"],
	embed: {
		dir: "companies",
		page: "/embed",
		scripts: "/embed/",
		shown: 20
	},
	quickSearch: {
		places: 2e3,
		shown: {
			fields: 2,
			cities: 2,
			companies: 4,
			lists: 2,
			places: 3
		}
	},
	bluesky: {
		file: "bluesky.json",
		concurrency: 12
	},
	handles: {
		dns: "https://cloudflare-dns.com/dns-query",
		timeoutMs: 8e3,
		concurrency: 12
	},
	workplaces: {
		file: "workplaces.json",
		perRun: 1500,
		concurrency: 2
	},
	ledger: {
		file: "offers.json",
		keepDays: 30
	},
	versions: {
		file: "versions.json",
		newAccountDays: 7
	},
	jobs: {
		pageSize: 50,
		companySearchFrom: 10,
		spread: 2,
		olderDays: 90,
		placesSuggested: 30,
		prepareChunk: 500,
		prepareWaitMs: 5e3,
		placesShown: 3,
		nearbyShown: 5,
		typingDelayMs: 200,
		notJobs: [
			"general application",
			"open application",
			"spontaneous application",
			"unsolicited application",
			"initiativbewerbung",
			"blindbewerbung",
			"candidature spontan[ée]e",
			"talent (pool|community|network)"
		],
		jobParam: "job",
		remoteWords: [
			"remote",
			"anywhere",
			"home office",
			"homeoffice",
			"work from home",
			"wfh",
			"distributed",
			"télétravail",
			"teletravail",
			"fernarbeit",
			"mobiles arbeiten"
		],
		hybridWords: ["hybrid", "hybride"],
		onsiteWords: [
			"on-site",
			"onsite",
			"on site",
			"in-office",
			"in office",
			"office-based",
			"office based",
			"in-person",
			"in person",
			"sur site",
			"vor ort"
		]
	},
	companies: { pageSize: 100 },
	companyForm: {
		kinds: [
			"company",
			"cooperative",
			"nonprofit",
			"collective",
			"project",
			"public"
		],
		foldAt: 320,
		nameMax: 100,
		descriptionMax: 3e3,
		tagsMax: 20,
		tagMax: 64,
		linksMax: 20,
		tagSuggestions: 8,
		boardCheckDelayMs: 600
	},
	listForm: {
		nameMax: 100,
		descriptionMax: 3e3,
		companiesMax: 2e3,
		suggestions: 8
	},
	saveSignIn: { returnMinutes: 30 },
	lists: {
		related: {
			shown: 6,
			nameWeight: 3,
			minTermLength: 3
		},
		explore: 8,
		shareMax: 300
	},
	me: { glance: 3 },
	kept: { max: 500 },
	jobCollections: {
		file: "joblist-collections.json",
		fileMaxBytes: 5e6,
		max: 100,
		jobsMax: 5e3,
		idMax: 40,
		nameMax: 80,
		titleMax: 300,
		companyMax: 200,
		urlMax: 2e3,
		keyMax: 2500
	},
	landing: {
		dir: "landing",
		shown: 50,
		linked: 20,
		pages: 10,
		minJobs: {
			city: 20,
			field: 20,
			cityField: 10
		},
		cityAliases: {
			nyc: "new-york",
			"new-york-city": "new-york",
			bangalore: "bengaluru",
			munchen: "munich",
			koln: "cologne",
			wien: "vienna",
			"ho-chi-minh-city": "ho-chi-minh",
			sf: "san-francisco",
			"washington-dc": "washington",
			"washington-d-c": "washington",
			gurgaon: "gurugram",
			bombay: "mumbai"
		},
		slugMax: 60,
		cacheSeconds: 1800,
		snapshotCacheSeconds: 900,
		missingCacheSeconds: 300,
		sitemap: "/sitemap-places.xml"
	},
	searchFeed: {
		path: "/feed/search.xml",
		file: "landing/recent.json",
		hours: 24,
		rows: 1e3,
		maxLength: 100
	},
	stats: {
		file: "stats.json",
		weeks: 104,
		cities: 20,
		weekCityMin: 3,
		minSample: 20,
		shownWeeks: 26
	},
	bot: {
		minHours: 160,
		tag: "joblistweekly",
		shown: 3
	},
	links: {
		signup: "https://bsky.app",
		profile: "https://bsky.app/profile/{handle}",
		handleHelp: "https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial"
	},
	analytics: {
		script: "/vendor/umami.js",
		hostUrl: "https://gateway.umami.is",
		websiteId: "479fa5c4-e9c9-4d8d-85c6-9a88c886dd24",
		domains: "joblist.today"
	},
	geocode: {
		service: "https://nominatim.openstreetmap.org/search",
		delayMs: 1100,
		officeBudget: 300,
		officeCategories: ["office"],
		officeMaxKm: 50,
		budget: 1100,
		tooWide: [
			"continent",
			"country",
			"state",
			"region",
			"province",
			"state_district",
			"county"
		],
		cityCountries: [
			"singapore",
			"hong kong",
			"luxembourg",
			"monaco",
			"macao",
			"vatican city",
			"gibraltar"
		],
		countryWords: [
			"usa",
			"us",
			"uk",
			"uae",
			"united states of america",
			"europe",
			"asia",
			"africa",
			"north america",
			"south america",
			"latin america"
		],
		cityRegions: [
			"JP-13",
			"CN-SH",
			"CN-BJ",
			"CN-TJ",
			"CN-CQ"
		],
		countryAliases: {
			uk: "gb",
			usa: "us",
			"united states": "us",
			uae: "ae"
		},
		placesFile: "places-2.json",
		officesFile: "offices.json",
		ignoreWords: /* @__PURE__ */ "hybrid.on-site.onsite.on site.office.headquarters.hq.multiple locations.various locations.flexible.friendly.travel required.jobs?.global.worldwide.international.distributed.emea.apac.latam.americas.amer.namer.nordics.dach.benelux".split(".")
	},
	travel: {
		kmPerHour: {
			walk: 5,
			bike: 15
		},
		mode: "bike",
		detour: 1.3,
		bandMinutes: 5,
		minutes: [
			15,
			30,
			45,
			60
		]
	},
	cache: { writeDelayMs: 400 },
	outbox: { retryMs: 3e4 },
	serviceWorker: {
		snapshotWaitMs: 4e3,
		snapshotFilesKept: 400
	},
	snapshot: {
		path: "https://raw.githubusercontent.com/joblisttoday/joblist-snapshot/gh-pages",
		everyHours: 6,
		companyFiles: 40,
		listsDir: "lists",
		maxAgeHours: 48,
		prerenderFiles: [
			"records.json",
			"jobs.json",
			"meta.json",
			"bluesky.json",
			"landing/index.json"
		],
		preload: {
			page: ["records.json"],
			counts: ["records.json", "counts.json"],
			company: ["records.json"],
			list: ["records.json", "counts.json"],
			explore: [
				"first.json",
				"records.json",
				"jobs.json"
			]
		},
		refreshDelayMs: 15e3
	},
	crawler: {
		service: "https://bsky.social",
		maxWritesPerRun: 200,
		maxNewCompaniesPerRun: 25,
		batchSize: 50,
		pauseSeconds: 10,
		concurrency: 8,
		out: "static/snapshot/crawl",
		openJobs: "https://raw.githubusercontent.com/elliottdehn/open-jobs/a6bb3ab9a96d87d02e4369cb97f55a8399e2d965/slugs.json",
		search: {
			service: "https://api.bsky.app",
			queries: [
				"we're hiring",
				"we are hiring",
				"#hiring",
				"join our team",
				"open roles",
				"now hiring",
				"job opening",
				"come work with us"
			],
			pages: 5
		},
		bluesky: {
			queries: [
				"careers",
				"jobs",
				"hiring",
				"join our team",
				"open roles"
			],
			pages: 1,
			followersOf: ["joblist.today"],
			followerPages: 3,
			maxAccounts: 40,
			maxConnect: 30,
			concurrency: 4
		}
	},
	jobPost: {
		days: 30,
		maxDays: 120,
		dayChoices: [
			7,
			14,
			30,
			60,
			120
		],
		titleMax: 200,
		descriptionMax: 1e4,
		page: "/job/{did}/{rkey}",
		remote: [
			"onsite",
			"hybrid",
			"remote"
		],
		employment: [
			"full-time",
			"part-time",
			"contract",
			"internship",
			"volunteer"
		],
		status: [
			"open",
			"filled",
			"closed"
		],
		schemaEmployment: {
			"full-time": "FULL_TIME",
			"part-time": "PART_TIME",
			contract: "CONTRACTOR",
			internship: "INTERN",
			volunteer: "VOLUNTEER"
		}
	}
}, H = /* @__PURE__ */ t({
	default: () => W,
	describe: () => G
});
async function U(e) {
	let { boardPageSize: t, jobsPerBoard: n } = V.limits, r = [];
	for (let i = 0; i < n; i += t) {
		let n = await c(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(e)}/postings?limit=${t}&offset=${i}`), a = n?.content || [];
		if (r.push(...a), a.length < t || r.length >= (n?.totalFound ?? 0)) break;
	}
	return r.slice(0, n);
}
async function W(e) {
	return (await U(e)).map((t) => ({
		id: t.id,
		title: t.name,
		url: `https://jobs.smartrecruiters.com/${encodeURIComponent(e)}/${t.id}`,
		location: t.location?.fullLocation,
		department: t.department?.label,
		published: t.releasedDate,
		remote: t.location?.remote ? "remote" : t.location?.hybrid ? "hybrid" : "onsite"
	}));
}
async function G(e, t) {
	let n = (await c(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(e)}/postings/${encodeURIComponent(t)}`))?.jobAd?.sections || {};
	return [
		n.jobDescription,
		n.qualifications,
		n.additionalInformation,
		n.companyDescription
	].filter((e) => e?.text).map((e) => `${e.title || ""}\n${S(e.text)}`.trim()).join("\n\n");
}
//#endregion
//#region src/lib/ats/workable.js
var K = /* @__PURE__ */ t({
	default: () => ce,
	describe: () => ue
});
async function ce(e) {
	return ((await c(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(e)}`))?.jobs || []).map((e) => ({
		id: e.shortcode,
		title: e.title,
		url: e.url || e.shortlink,
		location: e.telecommuting && !e.city ? l("Remote", e.country) : l(e.city, e.country),
		department: e.department,
		published: e.published_on,
		remote: e.telecommuting ? "remote" : void 0
	}));
}
var le = d((e) => c(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(e)}?details=true`));
async function ue(e, t) {
	let n = (await le(e))?.jobs?.find((e) => e.shortcode === t);
	return S(n?.description);
}
//#endregion
//#region src/lib/ats/index.js
var de = {
	ashby: _,
	greenhouse: E,
	lever: A,
	personio: re,
	recruitee: oe,
	rippling: R,
	smartrecruiters: H,
	workable: K
}, q = /* @__PURE__ */ new Map();
function fe(e) {
	let { provider: t = "", id: n = "" } = e.jobBoard || {}, r = de[t]?.default;
	if (!r || !n) return Promise.resolve([]);
	let i = `${t}:${n}`;
	return q.has(i) || q.set(i, r(n).then((t) => t.map((e) => ({
		...e,
		url: o(e.url)
	})).filter((e) => e.title && e.url).map((t) => ({
		...t,
		location: pe(t.location),
		company: e.key
	}))).catch(() => [])), q.get(i);
}
function pe(e) {
	return e?.split(",").map((e) => e.trim()).filter(Boolean).join(", ") || void 0;
}
//#endregion
//#region src/lib/ats/board-check.js
var me = {
	greenhouse: async (e) => (await c(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(e)}`))?.name,
	workable: async (e) => (await c(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(e)}`))?.name,
	smartrecruiters: async (e) => (await c(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(e)}/postings?limit=1`))?.content?.[0]?.company?.name,
	recruitee: async (e) => (await c(`https://${encodeURIComponent(e)}.recruitee.com/api/offers`))?.offers?.[0]?.company_name
};
async function he({ provider: e, id: t }) {
	try {
		return String(await me[e]?.(t) || "").trim();
	} catch {
		return "";
	}
}
new Map([
	{
		lexicon: 1,
		id: "today.joblist.company",
		description: "A company or organization, described by anyone, like a wiki page: each author's record is one version. The record key is the organization's domain, normalised: the website's host name, lowercase, without 'www.' (e.g. 'example.org' for https://www.Example.org/jobs), at most 253 characters (a DNS name). When the author's handle equals that domain, the record is the organization's own.",
		defs: {
			main: {
				type: "record",
				key: "any",
				record: {
					type: "object",
					required: ["name", "createdAt"],
					properties: {
						name: {
							type: "string",
							maxLength: 1e3,
							maxGraphemes: 100
						},
						url: {
							type: "string",
							format: "uri",
							description: "The organization's website."
						},
						description: {
							type: "string",
							maxLength: 3e4,
							maxGraphemes: 3e3
						},
						kind: {
							type: "string",
							maxLength: 64,
							knownValues: [
								"company",
								"cooperative",
								"nonprofit",
								"collective",
								"project",
								"public"
							],
							description: "What sort of organization it is: a company, a cooperative, a nonprofit, a collective, a project, a public body. Apps show others as unknown."
						},
						tags: {
							type: "array",
							maxLength: 20,
							items: {
								type: "string",
								maxLength: 640,
								maxGraphemes: 64
							}
						},
						locations: {
							type: "array",
							maxLength: 50,
							items: {
								type: "ref",
								ref: "#location"
							}
						},
						jobBoard: {
							type: "ref",
							ref: "#jobBoard"
						},
						links: {
							type: "array",
							maxLength: 20,
							description: "Other public pages of the organization (social profiles, wikipedia, etc.).",
							items: {
								type: "string",
								format: "uri"
							}
						},
						createdAt: {
							type: "string",
							format: "datetime",
							description: "When this author first described the organization."
						},
						updatedAt: {
							type: "string",
							format: "datetime",
							description: "When this author last saved this version. The most recently edited version is the one shown, unless the organization publishes its own."
						}
					}
				}
			},
			location: {
				type: "object",
				properties: {
					name: {
						type: "string",
						maxLength: 1e3,
						maxGraphemes: 100,
						description: "City or place name."
					},
					address: {
						type: "string",
						maxLength: 2e3,
						maxGraphemes: 200
					},
					country: {
						type: "string",
						maxLength: 1e3,
						maxGraphemes: 100
					},
					countryCode: {
						type: "string",
						minLength: 2,
						maxLength: 2,
						description: "ISO 3166-1 alpha-2 code of the country (e.g. 'DE'), alongside its name."
					},
					latitude: {
						type: "string",
						maxLength: 32,
						description: "Decimal degrees, as a string."
					},
					longitude: {
						type: "string",
						maxLength: 32,
						description: "Decimal degrees, as a string."
					}
				}
			},
			jobBoard: {
				type: "object",
				description: "Where the organization publishes its jobs.",
				properties: {
					provider: {
						type: "string",
						maxLength: 64,
						knownValues: [
							"ashby",
							"greenhouse",
							"lever",
							"personio",
							"recruitee",
							"rippling",
							"smartrecruiters",
							"workable"
						]
					},
					id: {
						type: "string",
						maxLength: 256,
						description: "The organization's identifier at the provider."
					},
					url: {
						type: "string",
						format: "uri",
						description: "Careers page, when there is no supported provider."
					}
				}
			}
		}
	},
	{
		lexicon: 1,
		id: "today.joblist.job",
		description: "A job offer, posted by anyone. When the author's handle equals the company key (its domain), it is the company's own offer. Offers expire; renew to extend. Applications never go through joblist: `apply` says where to send them.",
		defs: {
			main: {
				type: "record",
				key: "tid",
				record: {
					type: "object",
					required: [
						"title",
						"company",
						"url",
						"createdAt",
						"expiresAt"
					],
					properties: {
						title: {
							type: "string",
							maxLength: 2e3,
							maxGraphemes: 200
						},
						company: {
							type: "string",
							maxLength: 253,
							description: "Company record key: its domain, lowercase, without 'www.' (see today.joblist.company)."
						},
						url: {
							type: "string",
							format: "uri",
							description: "Where to read the offer: its page on the company's site or job board, or its joblist page. May equal the application link."
						},
						description: {
							type: "string",
							maxLength: 1e5,
							maxGraphemes: 1e4
						},
						locations: {
							type: "array",
							maxLength: 20,
							items: {
								type: "ref",
								ref: "today.joblist.company#location"
							}
						},
						remote: {
							type: "string",
							knownValues: [
								"onsite",
								"hybrid",
								"remote"
							]
						},
						employment: {
							type: "string",
							knownValues: [
								"full-time",
								"part-time",
								"contract",
								"internship",
								"volunteer"
							]
						},
						apply: {
							type: "ref",
							ref: "#apply"
						},
						salary: {
							type: "ref",
							ref: "#salary"
						},
						status: {
							type: "string",
							maxLength: 32,
							knownValues: [
								"open",
								"filled",
								"closed"
							],
							description: "Whether the offer still takes applications. Missing means open; a filled or closed offer is no longer shown."
						},
						applicantLocations: {
							type: "array",
							maxLength: 50,
							description: "Countries applicants can work from (ISO 3166-1 alpha-2 codes, e.g. 'DE'), for remote offers.",
							items: {
								type: "string",
								minLength: 2,
								maxLength: 2
							}
						},
						langs: {
							type: "array",
							maxLength: 3,
							description: "Languages the offer is written in (BCP-47 tags).",
							items: {
								type: "string",
								format: "language"
							}
						},
						createdAt: {
							type: "string",
							format: "datetime"
						},
						updatedAt: {
							type: "string",
							format: "datetime",
							description: "When the poster last edited the offer."
						},
						expiresAt: {
							type: "string",
							format: "datetime",
							description: "After this date the offer is no longer shown."
						}
					}
				}
			},
			salary: {
				type: "object",
				description: "What the job pays, in whole units of the currency (not cents). At least one of min and max.",
				required: ["currency", "period"],
				properties: {
					min: {
						type: "integer",
						minimum: 0
					},
					max: {
						type: "integer",
						minimum: 0
					},
					currency: {
						type: "string",
						minLength: 3,
						maxLength: 3,
						description: "ISO 4217 code, e.g. 'EUR'."
					},
					period: {
						type: "string",
						maxLength: 16,
						knownValues: [
							"year",
							"month",
							"week",
							"day",
							"hour"
						]
					}
				}
			},
			apply: {
				type: "object",
				description: "How to apply. Applications go straight to the poster: joblist never receives them.",
				properties: {
					url: {
						type: "string",
						format: "uri",
						description: "An application form (https://…) or an email address (mailto:…)."
					},
					bluesky: {
						type: "boolean",
						description: "Apply by sending a direct message to the poster's account on Bluesky."
					}
				}
			}
		}
	},
	{
		lexicon: 1,
		id: "today.joblist.list",
		description: "A list of companies curated by its author, who can let others add to it.",
		defs: { main: {
			type: "record",
			key: "tid",
			record: {
				type: "object",
				required: [
					"name",
					"companies",
					"createdAt"
				],
				properties: {
					name: {
						type: "string",
						maxLength: 1e3,
						maxGraphemes: 100
					},
					description: {
						type: "string",
						maxLength: 3e4,
						maxGraphemes: 3e3
					},
					companies: {
						type: "array",
						maxLength: 2e3,
						description: "Company record keys (domains), in the curator's order.",
						items: {
							type: "string",
							maxLength: 253
						}
					},
					copiedFrom: {
						type: "string",
						format: "at-uri",
						description: "The list this one was copied from."
					},
					open: {
						type: "boolean",
						description: "Anyone can add companies: companies suggested for this list (today.joblist.suggestion records) are shown in it at once, credited to who suggested them. Otherwise the author accepts or dismisses each one."
					},
					hidden: {
						type: "array",
						maxLength: 2e3,
						description: "Company record keys suggested by others that the author hid or dismissed.",
						items: {
							type: "string",
							maxLength: 253
						}
					},
					createdAt: {
						type: "string",
						format: "datetime"
					}
				}
			}
		} }
	},
	{
		lexicon: 1,
		id: "today.joblist.suggestion",
		description: "A company someone suggests for a list they do not own, written in their own repository. Open lists show it at once, credited to its author; for other lists, the list's author accepts or dismisses it.",
		defs: { main: {
			type: "record",
			key: "tid",
			record: {
				type: "object",
				required: [
					"list",
					"company",
					"createdAt"
				],
				properties: {
					list: {
						type: "string",
						format: "at-uri",
						description: "The today.joblist.list the company is suggested for."
					},
					company: {
						type: "string",
						maxLength: 253,
						description: "Company record key (its domain)."
					},
					note: {
						type: "string",
						maxLength: 3e3,
						maxGraphemes: 300,
						description: "Why it belongs in the list."
					},
					createdAt: {
						type: "string",
						format: "datetime"
					}
				}
			}
		} }
	}
].map((e) => [e.id, e]));
//#endregion
//#region src/lib/models/paste.js
function ge(e) {
	return e.split(/[-_\s]+/).filter(Boolean).map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(" ");
}
//#endregion
//#region embed/src/joblist-jobs.js
var J = {
	snapshot: "https://raw.githubusercontent.com/joblisttoday/joblist-snapshot/gh-pages",
	dir: "companies",
	site: "https://joblist.today",
	shown: 20,
	strings: {
		en: {
			title: "Open jobs at {name}",
			listTitle: "{name}: open jobs",
			count: "{count} open jobs",
			countOne: "1 open job",
			none: "No open jobs right now.",
			more: "See all {count}",
			by: "on joblist",
			error: "The jobs could not be read.",
			search: "Search these jobs",
			follow: "Follow these jobs",
			followHelp: "A feed (Atom): add it to a feed reader to see the new jobs as they come.",
			remote: {
				onsite: "On site",
				hybrid: "Hybrid",
				remote: "Remote"
			}
		},
		fr: {
			title: "Offres chez {name}",
			listTitle: "{name} : offres ouvertes",
			count: "{count} offres",
			countOne: "1 offre",
			none: "Aucune offre pour l'instant.",
			more: "Voir les {count}",
			by: "sur joblist",
			error: "Les offres n'ont pas pu être lues.",
			search: "Chercher dans ces offres",
			follow: "Suivre ces offres",
			followHelp: "Un flux (Atom) : ajoutez-le à un lecteur de flux pour voir les nouvelles offres dès qu'elles arrivent.",
			remote: {
				onsite: "Sur place",
				hybrid: "Hybride",
				remote: "Télétravail"
			}
		},
		de: {
			title: "Offene Stellen bei {name}",
			listTitle: "{name}: offene Stellen",
			count: "{count} offene Stellen",
			countOne: "1 offene Stelle",
			none: "Gerade keine offenen Stellen.",
			more: "Alle {count} ansehen",
			by: "auf joblist",
			error: "Die Jobs konnten nicht gelesen werden.",
			search: "Diese Jobs durchsuchen",
			follow: "Diesen Jobs folgen",
			followHelp: "Ein Feed (Atom): Füg ihn einem Feedreader hinzu, um neue Jobs zu sehen, sobald sie kommen.",
			remote: {
				onsite: "Vor Ort",
				hybrid: "Hybrid",
				remote: "Remote"
			}
		},
		es: {
			title: "Ofertas abiertas en {name}",
			listTitle: "{name}: ofertas abiertas",
			count: "{count} ofertas abiertas",
			countOne: "1 oferta abierta",
			none: "No hay ofertas abiertas por ahora.",
			more: "Ver las {count}",
			by: "en joblist",
			error: "No se pudieron leer las ofertas.",
			search: "Buscar en estas ofertas",
			follow: "Seguir estas ofertas",
			followHelp: "Un feed (Atom): añádelo a un lector de feeds para ver las nuevas ofertas a medida que llegan.",
			remote: {
				onsite: "Presencial",
				hybrid: "Híbrido",
				remote: "Remoto"
			}
		}
	}
}, Y = new CSSStyleSheet();
Y.replaceSync("\n	:host { display: block; font: inherit; font-family: var(--joblist-font, inherit); color: var(--joblist-fg, inherit); }\n	h2 { margin: 0 0 0.5em; font-size: 1.15em; }\n	a { color: inherit; }\n	ul { margin: 0; padding: 0; list-style: none; }\n	li { border-bottom: 1px solid var(--joblist-line, rgb(128 128 128 / 0.3)); }\n	li a { display: block; padding: 0.6em 0; text-decoration: none; }\n	li a:hover strong { text-decoration: underline; }\n	strong { display: block; }\n	small { display: block; color: var(--joblist-muted, rgb(128 128 128)); font-size: 0.85em; }\n	p { margin: 0.75em 0 0; color: var(--joblist-muted, rgb(128 128 128)); font-size: 0.85em; }\n	p a { color: var(--joblist-accent, inherit); }\n	input { box-sizing: border-box; width: 100%; margin: 0 0 0.5em; padding: 0.5em 0.75em; font: inherit; color: inherit; background: transparent; border: 1px solid var(--joblist-line, rgb(128 128 128 / 0.6)); border-radius: 0.5em; }\n");
function _e(e, { words: t, where: n, remote: r }) {
	let i = e.title.toLowerCase();
	return t.every((e) => i.includes(e)) && (!n || String(e.location || "").toLowerCase().includes(n)) && (!r || e.remote === "remote");
}
var ve = (e) => e.toLowerCase().split(/\s+/).filter(Boolean);
function ye(e) {
	try {
		let t = new URL(String(e));
		return t.protocol === "https:" || t.protocol === "http:" ? t.href : null;
	} catch {
		return null;
	}
}
function X(e) {
	let t = e.trim(), [, r, i] = t.match(/^([a-z]+):([^/\s]+)$/) || [];
	return r && i && n.some((e) => e.id === r) ? {
		provider: r,
		id: i
	} : t ? a(t) : null;
}
async function Z(e, t) {
	let n = await fe({
		key: t,
		jobBoard: e
	}), r = (e) => Date.parse(e || "") || 0;
	return n.map((e) => ({
		title: e.title,
		url: e.url,
		location: e.location,
		remote: e.remote,
		published: e.published
	})).sort((e, t) => r(t.published) - r(e.published));
}
async function be({ board: e, company: t, index: n }) {
	if (e) {
		let [t, n] = await Promise.all([he(e), Z(e, e.id)]);
		return {
			name: t || ge(e.id),
			jobs: n
		};
	}
	if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(t)) return null;
	let r = await fetch(`${n}/${J.dir}/${t}.json`).then((e) => e.ok ? e.json() : null).catch(() => null);
	if (!r) return null;
	let i = (Array.isArray(r.jobs) ? r.jobs : []).map((e) => ({
		title: String(e.t || ""),
		url: String(e.u || ""),
		location: e.l,
		remote: e.r,
		published: e.p,
		posted: !!e.s
	})), a = r.board?.provider && r.board?.id ? {
		provider: String(r.board.provider),
		id: String(r.board.id)
	} : null, o = a ? await Z(a, t) : [], s = o.length ? [...i.filter((e) => e.posted), ...o] : i;
	return {
		name: String(r.name || t),
		jobs: s
	};
}
function Q(e, t = {}, n = []) {
	let r = document.createElement(e);
	for (let [e, n] of Object.entries(t)) r.setAttribute(e, n);
	return r.append(...n), r;
}
var $ = (e, t) => e.replace(/\{(\w+)\}/g, (e, n) => String(t[n] ?? "")), xe = class extends HTMLElement {
	static observedAttributes = [
		"board",
		"company",
		"index",
		"lang",
		"limit",
		"query",
		"where",
		"remote",
		"search"
	];
	typed = "";
	found = null;
	connectedCallback() {
		this.shadowRoot || (this.attachShadow({ mode: "open" }).adoptedStyleSheets = [Y]), this.render();
	}
	attributeChangedCallback() {
		this.shadowRoot && this.render();
	}
	async render() {
		let e = this.shadowRoot, t = J, r = X(this.getAttribute("board") || ""), i = (this.getAttribute("company") || "").trim().toLowerCase(), a = (this.getAttribute("index") || t.snapshot).replace(/\/$/, ""), o = (this.getAttribute("lang") || document.documentElement.lang || navigator.language || "en").slice(0, 2).toLowerCase(), s = /^[a-z]{2}$/.test(o) && Intl.DateTimeFormat.supportedLocalesOf(o).length ? o : "en", c = t.strings[s] || t.strings.en, l = Math.max(1, Number(this.getAttribute("limit")) || t.shown), u = r ? `${r.provider}:${r.id}` : `${a}|${i}`;
		this.found?.key !== u && (this.found = {
			key: u,
			data: be({
				board: r,
				company: i,
				index: a
			})
		});
		let d = await this.found.data;
		if (!d) {
			e.replaceChildren(Q("p", {}, [c.error]));
			return;
		}
		let f = (this.getAttribute("query") || "").trim(), p = (this.getAttribute("where") || "").trim(), m = this.getAttribute("remote") === "remote", h = new URLSearchParams(), g = `${f} ${this.typed}`.trim();
		g && h.set("q", g), p && h.set("where", p), m && h.set("remote", "remote");
		let _ = i ? `${t.site}/company/${i}${h.size ? `#${h}` : ""}` : "", v = r && n.find((e) => e.id === r.provider)?.board.replace("{id}", encodeURIComponent(r.id)) || "", y = _ || v, b = {
			words: ve(`${f} ${this.typed}`),
			where: p.toLowerCase(),
			remote: m
		}, x = d.jobs.filter((e) => e.title && _e(e, b)), S = new Intl.DateTimeFormat(s, {
			month: "short",
			day: "numeric"
		}), C = x.slice(0, l).flatMap((e) => {
			let t = ye(e.url);
			if (!t) return [];
			let n = Date.parse(e.published || ""), r = [
				e.location,
				c.remote[e.remote || ""],
				Number.isFinite(n) ? S.format(n) : ""
			].filter(Boolean).join(" · ");
			return [Q("li", {}, [Q("a", {
				href: t,
				target: "_blank",
				rel: "noopener"
			}, [Q("strong", {}, [e.title]), r ? Q("small", {}, [r]) : ""])])];
		}), w = x.length === 1 ? c.countOne : $(c.count, { count: x.length.toLocaleString(s) }), T = C.length ? Q("ul", {}, C) : Q("p", {}, [c.none]), E = Q("p", {}, [
			x.length > C.length && y ? Q("a", {
				href: y,
				target: "_blank",
				rel: "noopener"
			}, [$(c.more, { count: w })]) : w,
			" · ",
			Q("a", {
				href: t.site,
				target: "_blank",
				rel: "noopener"
			}, [c.by])
		]);
		if (e.querySelector("input") && this.hasAttribute("search")) {
			e.querySelector("ul, p:not(:last-child)")?.replaceWith(T), e.lastElementChild?.replaceWith(E);
			return;
		}
		let D = this.hasAttribute("search") ? Q("input", {
			type: "search",
			"aria-label": c.search,
			placeholder: c.search
		}) : "";
		D instanceof HTMLInputElement && D.addEventListener("input", () => {
			this.typed = D.value, this.render();
		});
		let O = $(c.title, { name: d.name || r?.id || i });
		e.replaceChildren(Q("h2", {}, y ? [Q("a", {
			href: y,
			target: "_blank",
			rel: "noopener"
		}, [O])] : [O]), D, T, E);
	}
};
customElements.get("joblist-jobs") || customElements.define("joblist-jobs", xe);
//#endregion
export { X as boardOf };
