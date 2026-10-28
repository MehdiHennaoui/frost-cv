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

type RouteTitleKey =
	| (typeof ROUTE_PAGE_TITLE_KEYS)[RouteWithPageTitle]
	| "cvEditor.loading";

type RouteTitleMatch = {
	routeId: string;
	status: string;
	pageTitle?: string;
};

/** Loading title while the editor loader is pending so "CV not found" does not flash. */
export function resolveRoutePageTitle(
	match: RouteTitleMatch | undefined,
	translate: (key: RouteTitleKey) => string,
): string {
	if (!match) {
		return "Frost CV";
	}

	if (match.pageTitle) {
		return match.pageTitle;
	}

	if (match.routeId === "/cvs_/$cvId" && match.status === "pending") {
		return translate("cvEditor.loading");
	}

	if (isRouteWithPageTitle(match.routeId)) {
		return translate(ROUTE_PAGE_TITLE_KEYS[match.routeId]);
	}

	return "Frost CV";
}
