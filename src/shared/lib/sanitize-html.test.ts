/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";

import { sanitizeCvHtml } from "./sanitize-html";

describe("sanitizeCvHtml", () => {
	it("keeps TipTap-safe tags and https links", () => {
		expect(
			sanitizeCvHtml(
				'<p>Hello <strong>world</strong></p><ul><li><a href="https://example.com">site</a></li></ul>',
			),
		).toContain("<strong>world</strong>");
		expect(sanitizeCvHtml('<a href="https://example.com">x</a>')).toContain(
			'href="https://example.com"',
		);
	});

	it("strips scripts and unsafe hrefs", () => {
		expect(sanitizeCvHtml("<p>ok<script>alert(1)</script></p>")).toBe(
			"<p>ok</p>",
		);
		expect(sanitizeCvHtml('<a href="javascript:alert(1)">x</a>')).not.toContain(
			"javascript:",
		);
	});
});
