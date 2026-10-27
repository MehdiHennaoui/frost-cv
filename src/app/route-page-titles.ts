/** routeId → i18n key. Add a page = add an entry; AppLayout stays unchanged. */
export const ROUTE_PAGE_TITLE_KEYS = {
	"/cvs": "cvList.heading",
	"/cvs_/$cvId": "cvEditor.notFound",
} as const;

export type RouteWithPageTitle = keyof typeof ROUTE_PAGE_TITLE_KEYS;

export function isRouteWithPageTitle(
	routeId: string,
): routeId is RouteWithPageTitle {
	return Object.hasOwn(ROUTE_PAGE_TITLE_KEYS, routeId);
}
