import { Link, Text } from "@react-pdf/renderer";
import type { ReactNode } from "react";

import { sanitizeCvHtml } from "@/shared/lib/sanitize-html";
import { text } from "./pdf-text";

type PdfTextStyle = {
	fontFamily?: string;
	fontSize?: number;
	lineHeight?: number;
	textDecoration?: "none" | "underline" | "line-through";
	color?: string;
	marginBottom?: number;
};

const BODY: PdfTextStyle = {
	...text("sm"),
	fontFamily: "Helvetica",
};
const LINK: PdfTextStyle = {
	...BODY,
	color: "#000",
	textDecoration: "underline",
};
/** Prefer filling leftover page space over moving a whole block (react-pdf default is 2). */
const flowText = { orphans: 1, widows: 1 } as const;
const listItemStyle = { ...BODY, marginBottom: 2, paddingLeft: 12 };

/** Maps sanitized TipTap HTML into React PDF Text/Link/View trees. */
export function tipTapHtmlToReactPdf(html: string): ReactNode {
	const sanitized = sanitizeCvHtml(html);
	if (!sanitized) {
		return null;
	}
	const doc = new DOMParser().parseFromString(sanitized, "text/html");
	return mapChildren(doc.body, BODY);
}

function mapChildren(parent: ParentNode, style: PdfTextStyle): ReactNode {
	const nodes = Array.from(parent.childNodes)
		.map((node, index) => mapNode(node, style, index))
		.filter((node) => node != null);
	if (nodes.length === 0) {
		return null;
	}
	if (nodes.length === 1) {
		return nodes[0];
	}
	return nodes;
}

function mapNode(node: ChildNode, style: PdfTextStyle, key: number): ReactNode {
	if (node.nodeType === Node.TEXT_NODE) {
		const value = node.textContent ?? "";
		if (!value) {
			return null;
		}
		return (
			<Text key={key} style={style} {...flowText}>
				{value}
			</Text>
		);
	}
	if (node.nodeType !== Node.ELEMENT_NODE) {
		return null;
	}
	const el = node as HTMLElement;
	switch (el.tagName) {
		case "BR":
			return (
				<Text key={key} style={style} {...flowText}>
					{"\n"}
				</Text>
			);
		case "STRONG":
		case "B": {
			const next = { ...style, fontFamily: "Helvetica-Bold" };
			return (
				<Text key={key} style={next} {...flowText}>
					{mapChildren(el, next)}
				</Text>
			);
		}
		case "EM":
		case "I": {
			const next = { ...style, fontFamily: "Helvetica-Oblique" };
			return (
				<Text key={key} style={next} {...flowText}>
					{mapChildren(el, next)}
				</Text>
			);
		}
		case "A": {
			const href = el.getAttribute("href") ?? "";
			if (!href) {
				return (
					<Text key={key} style={style} {...flowText}>
						{mapChildren(el, style)}
					</Text>
				);
			}
			return (
				<Link key={key} src={href} style={LINK} {...flowText}>
					{mapChildren(el, LINK) ?? href}
				</Link>
			);
		}
		case "P": {
			const children = mapChildren(el, style);
			// TipTap blank lines are <p></p> / <p><br></p>; empty Text collapses in react-pdf.
			const isBlank =
				(el.textContent ?? "").replace(/\u00a0/g, "").trim() === "";
			if (children == null || isBlank) {
				return (
					<Text key={key} style={{ ...style, marginBottom: 2 }} {...flowText}>
						{"\u00A0"}
					</Text>
				);
			}
			return (
				<Text key={key} style={{ ...style, marginBottom: 2 }} {...flowText}>
					{children}
				</Text>
			);
		}
		case "UL":
			// Flat items (no wrapping View) so bullets can fill leftover page space one by one.
			return Array.from(el.children).map((li, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static TipTap snapshot, no stable li id
				<Text key={`${key}-${index}`} style={listItemStyle} {...flowText}>
					• {mapChildren(li, style)}
				</Text>
			));
		case "OL":
			return Array.from(el.children).map((li, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static TipTap snapshot, no stable li id
				<Text key={`${key}-${index}`} style={listItemStyle} {...flowText}>
					{index + 1}. {mapChildren(li, style)}
				</Text>
			));
		case "LI":
			return (
				<Text key={key} style={style} {...flowText}>
					{mapChildren(el, style)}
				</Text>
			);
		default:
			return mapChildren(el, style);
	}
}
