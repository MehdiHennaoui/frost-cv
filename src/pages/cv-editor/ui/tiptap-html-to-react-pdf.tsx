import { Link, Text, View } from "@react-pdf/renderer";
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
			<Text key={key} style={style}>
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
				<Text key={key} style={style}>
					{"\n"}
				</Text>
			);
		case "STRONG":
		case "B": {
			const next = { ...style, fontFamily: "Helvetica-Bold" };
			return (
				<Text key={key} style={next}>
					{mapChildren(el, next)}
				</Text>
			);
		}
		case "EM":
		case "I": {
			const next = { ...style, fontFamily: "Helvetica-Oblique" };
			return (
				<Text key={key} style={next}>
					{mapChildren(el, next)}
				</Text>
			);
		}
		case "A": {
			const href = el.getAttribute("href") ?? "";
			if (!href) {
				return (
					<Text key={key} style={style}>
						{mapChildren(el, style)}
					</Text>
				);
			}
			return (
				<Link key={key} src={href} style={LINK}>
					{mapChildren(el, LINK) ?? href}
				</Link>
			);
		}
		case "P": {
			const children = mapChildren(el, style);
			if (children == null) {
				return null;
			}
			return (
				<Text key={key} style={{ ...style, marginBottom: 2 }}>
					{children}
				</Text>
			);
		}
		case "UL":
			return (
				<View key={key} style={{ marginBottom: 4, paddingLeft: 12 }}>
					{Array.from(el.children).map((li, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static TipTap snapshot, no stable li id
						<Text key={index} style={{ ...style, marginBottom: 2 }}>
							• {mapChildren(li, style)}
						</Text>
					))}
				</View>
			);
		case "OL":
			return (
				<View key={key} style={{ marginBottom: 4, paddingLeft: 12 }}>
					{Array.from(el.children).map((li, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static TipTap snapshot, no stable li id
						<Text key={index} style={{ ...style, marginBottom: 2 }}>
							{index + 1}. {mapChildren(li, style)}
						</Text>
					))}
				</View>
			);
		case "LI":
			return (
				<Text key={key} style={style}>
					{mapChildren(el, style)}
				</Text>
			);
		default:
			return mapChildren(el, style);
	}
}
