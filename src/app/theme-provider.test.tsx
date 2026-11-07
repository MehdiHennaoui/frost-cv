/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider, useTheme } from "./theme-provider";

vi.mock("@tanstack/react-router", () => ({
	ScriptOnce: () => null,
}));

function installMatchMedia(matches: boolean) {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: (query: string) => ({
			matches,
			media: query,
			addEventListener: () => {},
			removeEventListener: () => {},
		}),
	});
}

function Probe() {
	const { setTheme } = useTheme();
	return (
		<button type="button" onClick={() => setTheme("dark")}>
			Dark
		</button>
	);
}

afterEach(() => {
	cleanup();
	localStorage.clear();
	document.documentElement.className = "";
});

describe("ThemeProvider", () => {
	it("stores the chosen theme and applies it on the document", () => {
		installMatchMedia(false);
		render(
			<ThemeProvider>
				<Probe />
			</ThemeProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Dark" }));

		expect(localStorage.getItem("theme")).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(document.documentElement.classList.contains("light")).toBe(false);
	});
});
