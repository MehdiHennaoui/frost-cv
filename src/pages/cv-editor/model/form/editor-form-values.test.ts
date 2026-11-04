import { describe, expect, it } from "vitest";

import { createEmptyCvContent } from "@/entities/cv";
import {
	editorContentFromValues,
	editorFormValuesOf,
} from "./editor-form-values";

describe("editorContentFromValues", () => {
	it("keeps stored keys the editor does not edit", () => {
		const content = {
			...createEmptyCvContent(),
			theme: "frost",
			identity: {
				firstName: "Ada",
				nickname: "A",
			},
			experiences: [
				{
					id: "exp-1",
					jobTitle: "Analyst",
					notes: "keep",
					isCurrent: false,
					endMonth: "2020-01",
				},
			],
		};
		const values = editorFormValuesOf(content);
		values.identity.firstName = "Grace";
		values.experiences[0] = {
			...values.experiences[0],
			jobTitle: "Lead",
			isCurrent: true,
			endMonth: "2024-01",
		};

		const next = editorContentFromValues(content, values);

		expect(next.theme).toBe("frost");
		expect(next.identity).toMatchObject({
			firstName: "Grace",
			nickname: "A",
		});
		expect(next.experiences).toEqual([
			expect.objectContaining({
				id: "exp-1",
				jobTitle: "Lead",
				notes: "keep",
				isCurrent: true,
				endMonth: "",
			}),
		]);
	});
});

describe("editorFormValuesOf", () => {
	it("fills a section order that is missing a builtin and drops a dangling custom key", () => {
		const values = editorFormValuesOf({
			...createEmptyCvContent(),
			customSections: [{ id: "c-1", title: "Talks", description: "" }],
			sectionOrder: ["identity", "experiences", "languages", "custom:gone"],
		});

		expect(values.sectionOrder).toEqual([
			"identity",
			"experiences",
			"education",
			"languages",
			"custom:c-1",
		]);
	});
});
