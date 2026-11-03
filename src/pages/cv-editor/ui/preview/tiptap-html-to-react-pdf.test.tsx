/** @vitest-environment jsdom */

import { Link, Text, View } from "@react-pdf/renderer";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { space } from "./pdf-text";
import { tipTapHtmlToReactPdf } from "./tiptap-html-to-react-pdf";

function walk(
	node: ReactNode,
	visit: (
		el: ReactElement<{ style?: { fontFamily?: string }; src?: string }>,
	) => void,
) {
	if (node == null || typeof node === "boolean") {
		return;
	}
	if (Array.isArray(node)) {
		for (const child of node) {
			walk(child, visit);
		}
		return;
	}
	if (!isValidElement(node)) {
		return;
	}
	visit(
		node as ReactElement<{ style?: { fontFamily?: string }; src?: string }>,
	);
	walk((node as ReactElement<{ children?: ReactNode }>).props.children, visit);
}

describe("tipTapHtmlToReactPdf", () => {
	it("maps bold, italic, list, and link into React PDF nodes", () => {
		const nodes = tipTapHtmlToReactPdf(
			'<p>Hello <strong>bold</strong> <em>italic</em></p><ul><li>one</li></ul><ol><li>first</li></ol><p><a href="https://example.com">site</a></p><script>alert(1)</script>',
		);
		expect(nodes).not.toBeNull();

		const fonts: string[] = [];
		const hrefs: string[] = [];
		let sawBullet = false;
		let sawOrdered = false;
		walk(nodes, (el) => {
			if (el.type === Text && el.props.style?.fontFamily) {
				fonts.push(el.props.style.fontFamily);
			}
			if (el.type === Link && el.props.src) {
				hrefs.push(el.props.src);
			}
			const children = (el as ReactElement<{ children?: ReactNode }>).props
				.children;
			const parts = Array.isArray(children)
				? children
				: children == null
					? []
					: [children];
			const flat = parts.map(String).join("");
			if (flat.includes("•")) {
				sawBullet = true;
			}
			if (flat.includes("1.")) {
				sawOrdered = true;
			}
		});

		expect(fonts).toContain("Helvetica-Bold");
		expect(fonts).toContain("Helvetica-Oblique");
		expect(hrefs).toContain("https://example.com");
		expect(sawBullet).toBe(true);
		expect(sawOrdered).toBe(true);
	});

	it("returns null for empty HTML", () => {
		expect(tipTapHtmlToReactPdf("")).toBeNull();
	});

	it("maps TipTap blank paragraphs to space-1 height Views", () => {
		const nodes = tipTapHtmlToReactPdf(
			"<p>first</p><p></p><p><br></p><p>second</p>",
		);
		expect(Array.isArray(nodes)).toBe(true);
		const list = nodes as ReactElement<{
			style?: { height?: number };
			children?: ReactNode;
		}>[];
		expect(list.map((el) => el.type)).toEqual([Text, View, View, Text]);
		expect(list[1]?.props.style).toEqual({ height: space[1] });
		expect(list[2]?.props.style).toEqual({ height: space[1] });
	});
});
