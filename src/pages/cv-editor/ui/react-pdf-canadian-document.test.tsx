/** @vitest-environment jsdom */

import { Page, pdf } from "@react-pdf/renderer";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { type Cv, createEmptyCvContent } from "@/entities/cv";
import { ReactPdfCanadianDocument } from "./react-pdf-canadian-document";

function sampleCv(overrides: Partial<Cv> = {}): Cv {
	return {
		id: "cv-1",
		title: "Frontend CV",
		locale: "en",
		content: createEmptyCvContent(),
		createdAt: 1,
		updatedAt: 1,
		...overrides,
	};
}

function documentOf(cv: Cv) {
	return ReactPdfCanadianDocument({ cv });
}

function reactPdfTexts(node: ReactNode): string[] {
	if (node == null || typeof node === "boolean") {
		return [];
	}
	if (typeof node === "string" || typeof node === "number") {
		return [String(node)];
	}
	if (Array.isArray(node)) {
		return node.flatMap(reactPdfTexts);
	}
	if (!isValidElement(node)) {
		return [];
	}
	return reactPdfTexts(
		(node as ReactElement<{ children?: ReactNode }>).props.children,
	);
}

function reactPdfPageSizes(node: ReactNode): Array<string | number[]> {
	const sizes: Array<string | number[]> = [];
	const walk = (current: ReactNode) => {
		if (current == null || typeof current === "boolean") {
			return;
		}
		if (Array.isArray(current)) {
			for (const child of current) {
				walk(child);
			}
			return;
		}
		if (!isValidElement(current)) {
			return;
		}
		const el = current as ReactElement<{
			size?: string | number[];
			children?: ReactNode;
		}>;
		if (el.type === Page && el.props.size != null) {
			sizes.push(el.props.size);
		}
		walk(el.props.children);
	};
	walk(node);
	return sizes;
}

describe("ReactPdfCanadianDocument", () => {
	it("uses Letter page and draws no page-number chrome into content", async () => {
		const tree = documentOf(sampleCv());
		expect(reactPdfPageSizes(tree)).toEqual(["LETTER"]);

		const joined = reactPdfTexts(tree).join("\n");
		expect(joined).not.toMatch(/\bpage\s+\d+\b/i);
		expect(joined).not.toMatch(/\d+\s*\/\s*\d+/);

		const blob = await pdf(tree).toBlob();
		const bytes = Buffer.from(await blob.arrayBuffer()).toString("latin1");
		expect(bytes).toMatch(
			/\/MediaBox\s*\[\s*0\s+0\s+612(\.0)?\s+792(\.0)?\s*\]/,
		);
	});

	it("renders experiences with Present and TipTap body text", () => {
		const tree = documentOf(
			sampleCv({
				content: {
					...createEmptyCvContent(),
					identity: {
						firstName: "Ada",
						lastName: "Lovelace",
						jobTitle: "Analyst",
						description: "<p>Built <strong>engines</strong></p>",
					},
					experiences: [
						{
							id: "exp-1",
							jobTitle: "Engineer",
							company: "Acme",
							location: "Montreal",
							startMonth: "2020-01",
							endMonth: "",
							isCurrent: true,
							description: "<p>Shipped features</p>",
						},
					],
				},
			}),
		);

		const texts = reactPdfTexts(tree);
		expect(texts).toContain("Ada Lovelace");
		expect(texts).toContain("Analyst");
		expect(texts).toContain("engines");
		expect(texts).toContain("Engineer · Acme");
		expect(texts).toContain("Jan 2020 – Present");
		expect(texts).toContain("Montreal");
		expect(texts).toContain("Shipped features");
	});

	it("uses CV locale labels (Présent / French section titles)", () => {
		const tree = documentOf(
			sampleCv({
				locale: "fr",
				content: {
					...createEmptyCvContent(),
					experiences: [
						{
							id: "exp-1",
							jobTitle: "Ingénieure",
							company: "Acme",
							location: "",
							startMonth: "2020-01",
							endMonth: "",
							isCurrent: true,
							description: "",
						},
					],
				},
			}),
		);

		const texts = reactPdfTexts(tree);
		expect(texts).toContain("janv. 2020 – Présent");
		expect(texts).toContain("Expériences");
		expect(texts).toContain("Formation");
		expect(texts).toContain("Langues");
	});

	it("follows saved section order including custom sections", () => {
		const tree = documentOf(
			sampleCv({
				content: {
					...createEmptyCvContent(),
					customSections: [
						{
							id: "c1",
							title: "Skills",
							description: "<p>Rust</p><script>alert(1)</script>",
						},
					],
					sectionOrder: [
						"identity",
						"education",
						"languages",
						"experiences",
						"custom:c1",
					],
				},
			}),
		);

		const texts = reactPdfTexts(tree);
		const education = texts.indexOf("Education");
		const languages = texts.indexOf("Languages");
		const experiences = texts.indexOf("Experiences");
		const skills = texts.indexOf("Skills");
		expect(education).toBeGreaterThanOrEqual(0);
		expect(languages).toBeGreaterThan(education);
		expect(experiences).toBeGreaterThan(languages);
		expect(skills).toBeGreaterThan(experiences);
		expect(texts).toContain("Rust");
		expect(texts.join("")).not.toContain("alert");
	});
});
