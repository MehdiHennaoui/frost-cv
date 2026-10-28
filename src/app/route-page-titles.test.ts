import { describe, expect, it } from "vitest";

import { resolveRoutePageTitle } from "./route-page-titles";

const translate = (key: string) => key;

describe("resolveRoutePageTitle", () => {
	it("uses a neutral loading title while the CV loader is pending", () => {
		expect(
			resolveRoutePageTitle(
				{ routeId: "/cvs_/$cvId", status: "pending" },
				translate,
			),
		).toBe("cvEditor.loading");
	});

	it("uses the CV title once the loader has it", () => {
		expect(
			resolveRoutePageTitle(
				{
					routeId: "/cvs_/$cvId",
					status: "success",
					pageTitle: "Frontend CV",
				},
				translate,
			),
		).toBe("Frontend CV");
	});

	it("shows not found only after the loader finishes without a title", () => {
		expect(
			resolveRoutePageTitle(
				{ routeId: "/cvs_/$cvId", status: "success" },
				translate,
			),
		).toBe("cvEditor.notFound");
	});

	it("keeps the list heading while the list loader is pending", () => {
		expect(
			resolveRoutePageTitle({ routeId: "/cvs", status: "pending" }, translate),
		).toBe("cvList.heading");
	});
});
