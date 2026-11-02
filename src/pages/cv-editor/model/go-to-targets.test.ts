import { describe, expect, it } from "vitest";

import { createEmptyCvContent, customSectionKey } from "@/entities/cv";
import { buildGoToTargets } from "./go-to-targets";

const labels = {
	identity: "Identity",
	experiences: "Experiences",
	education: "Education",
	languages: "Languages",
	untitledCustom: "Untitled section",
};

describe("buildGoToTargets", () => {
	it("lists identity, sections in order, and entry scan labels under list sections", () => {
		const content = {
			...createEmptyCvContent(),
			experiences: [
				{
					id: "exp-1",
					jobTitle: "Engineer",
					company: "Acme",
					location: "",
					startMonth: "",
					endMonth: "",
					isCurrent: false,
					description: "",
				},
			],
			education: [
				{
					id: "edu-1",
					degree: "B.Sc.",
					school: "McGill",
					location: "",
					startMonth: "",
					endMonth: "",
				},
			],
			languages: [{ id: "lang-1", language: "French", level: "" }],
			customSections: [
				{ id: "cust-1", title: "Projects", description: "" },
				{ id: "cust-2", title: "  ", description: "" },
			],
			sectionOrder: [
				"identity",
				"languages",
				"experiences",
				"education",
				customSectionKey("cust-1"),
				customSectionKey("cust-2"),
			],
		};

		expect(buildGoToTargets(content, labels)).toEqual([
			{
				id: "identity",
				label: "Identity",
				groupId: "identity",
				groupLabel: "Identity",
			},
			{
				id: "languages",
				label: "Languages",
				groupId: "languages",
				groupLabel: "Languages",
			},
			{
				id: "lang-1",
				label: "1 · French",
				groupId: "languages",
				groupLabel: "Languages",
			},
			{
				id: "experiences",
				label: "Experiences",
				groupId: "experiences",
				groupLabel: "Experiences",
			},
			{
				id: "exp-1",
				label: "1 · Engineer · Acme",
				groupId: "experiences",
				groupLabel: "Experiences",
			},
			{
				id: "education",
				label: "Education",
				groupId: "education",
				groupLabel: "Education",
			},
			{
				id: "edu-1",
				label: "1 · B.Sc. · McGill",
				groupId: "education",
				groupLabel: "Education",
			},
			{
				id: "cust-1",
				label: "Projects",
				groupId: "cust-1",
				groupLabel: "Projects",
			},
			{
				id: "cust-2",
				label: "Untitled section",
				groupId: "cust-2",
				groupLabel: "Untitled section",
			},
		]);
	});
});
