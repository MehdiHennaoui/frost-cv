/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it } from "vitest";

import {
	SidebarPortalProvider,
	useSidebarPortalHost,
} from "@/shared/lib/sidebar-portal";
import { CvListPending } from "./cvs";
import { CvEditorPending } from "./cvs_.$cvId";

function HostBinder({ host }: { host: HTMLElement }) {
	const { setHost } = useSidebarPortalHost();

	useEffect(() => {
		setHost(host);
		return () => setHost(null);
	}, [host, setHost]);

	return null;
}

afterEach(() => {
	cleanup();
});

function skeletonCount(): number {
	return document.querySelectorAll("[data-slot=skeleton]").length;
}

describe("CvListPending", () => {
	it("shows list skeletons and a loading name", () => {
		render(<CvListPending />);

		expect(screen.getByRole("main").getAttribute("aria-busy")).toBe("true");
		expect(screen.getByText("cvList.loading")).toBeTruthy();
		expect(skeletonCount()).toBeGreaterThan(1);
		expect(screen.queryByRole("button")).toBeNull();
	});
});

describe("CvEditorPending", () => {
	it("shows sidebar and preview skeletons without edit fields", () => {
		const host = document.createElement("div");
		document.body.appendChild(host);

		render(
			<SidebarPortalProvider>
				<HostBinder host={host} />
				<CvEditorPending />
			</SidebarPortalProvider>,
		);

		expect(screen.getByRole("main").getAttribute("aria-busy")).toBe("true");
		expect(screen.getByText("cvEditor.loading")).toBeTruthy();
		expect(skeletonCount()).toBeGreaterThan(1);
		expect(
			host.querySelectorAll("[data-slot=skeleton]").length,
		).toBeGreaterThan(1);
		expect(screen.queryByRole("textbox")).toBeNull();
		expect(document.querySelector("[data-cv-preview]")).toBeNull();
	});
});
