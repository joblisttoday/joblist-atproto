/**
 * The app's icons (Lucide, ISC licence), by what they mean here: data such as
 * nav.json names them, and one place decides how each meaning looks.
 * Only these are bundled.
 */
import ArrowLeft from '@lucide/svelte/icons/arrow-left';
import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
import BadgeCheck from '@lucide/svelte/icons/badge-check';
import Banknote from '@lucide/svelte/icons/banknote';
import Bike from '@lucide/svelte/icons/bike';
import Bookmark from '@lucide/svelte/icons/bookmark';
import BookmarkCheck from '@lucide/svelte/icons/bookmark-check';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';
import Ellipsis from '@lucide/svelte/icons/ellipsis';
import CircleCheck from '@lucide/svelte/icons/circle-check';
import Eye from '@lucide/svelte/icons/eye';
import EyeOff from '@lucide/svelte/icons/eye-off';
import Building2 from '@lucide/svelte/icons/building-2';
import Briefcase from '@lucide/svelte/icons/briefcase';
import Footprints from '@lucide/svelte/icons/footprints';
import House from '@lucide/svelte/icons/house';
import Inbox from '@lucide/svelte/icons/inbox';
import List from '@lucide/svelte/icons/list';
import LocateFixed from '@lucide/svelte/icons/locate-fixed';
import LogIn from '@lucide/svelte/icons/log-in';
import Plus from '@lucide/svelte/icons/plus';
import ScanSearch from '@lucide/svelte/icons/scan-search';
import Search from '@lucide/svelte/icons/search';
import Pencil from '@lucide/svelte/icons/pencil';
import Share2 from '@lucide/svelte/icons/share-2';
import Trash2 from '@lucide/svelte/icons/trash-2';
import MapPin from '@lucide/svelte/icons/map-pin';
import MapIcon from '@lucide/svelte/icons/map';
import LayoutGrid from '@lucide/svelte/icons/layout-grid';
import Rows3 from '@lucide/svelte/icons/rows-3';
import User from '@lucide/svelte/icons/user';
import X from '@lucide/svelte/icons/x';

export const icons = {
	jobs: Briefcase,
	saved: Bookmark,
	save: Bookmark,
	savedOn: BookmarkCheck,
	companies: Building2,
	lists: List,
	post: Plus,
	add: Plus,
	added: Check,
	me: User,
	signin: LogIn,
	near: LocateFixed,
	remote: House,
	pay: Banknote,
	area: ScanSearch,
	close: X,
	back: ArrowLeft,
	external: ArrowUpRight,
	verified: BadgeCheck,
	bike: Bike,
	walk: Footprints,
	applied: CircleCheck,
	hide: EyeOff,
	unhide: Eye,
	search: Search,
	place: MapPin,
	map: MapIcon,
	listView: Rows3,
	gridView: LayoutGrid,
	more: Ellipsis,
	share: Share2,
	edit: Pencil,
	copy: Copy,
	delete: Trash2,
	suggestions: Inbox
};

/** @typedef {keyof typeof icons} IconName */
