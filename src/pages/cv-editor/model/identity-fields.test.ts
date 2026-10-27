import { describe, expect, it } from "vitest";

import {
	identityFieldsEqual,
	identityFieldsOf,
	withIdentity,
} from "./identity-fields";

describe("identityFieldsOf", () => {
	it("reads string fields from persisted identity", () => {
		expect(
			identityFieldsOf({
				identity: { firstName: "Ada", lastName: "Lovelace", jobTitle: 1 },
			}),
		).toMatchObject({
			firstName: "Ada",
			lastName: "Lovelace",
			jobTitle: "",
		});
	});

	it("returns empty fields when identity is missing", () => {
		expect(identityFieldsOf({}).firstName).toBe("");
	});
});

describe("withIdentity", () => {
	it("replaces identity and keeps other content keys", () => {
		const next = withIdentity(
			{ identity: {}, experiences: [{ id: "1" }], sectionOrder: ["identity"] },
			{
				firstName: "Ada",
				lastName: "Lovelace",
				jobTitle: "Analyst",
				email: "ada@example.com",
				phone: "",
				postalCode: "",
				linkedin: "",
				github: "",
				website: "",
				description: "<p>Hi</p>",
			},
		);

		expect(next.experiences).toEqual([{ id: "1" }]);
		expect(next.identity).toEqual({
			firstName: "Ada",
			lastName: "Lovelace",
			jobTitle: "Analyst",
			email: "ada@example.com",
			phone: "",
			postalCode: "",
			linkedin: "",
			github: "",
			website: "",
			description: "<p>Hi</p>",
		});
	});
});

describe("identityFieldsEqual", () => {
	it("compares field-by-field", () => {
		const a = identityFieldsOf({ identity: { firstName: "Ada" } });
		const b = identityFieldsOf({ identity: { firstName: "Ada" } });
		const c = identityFieldsOf({ identity: { firstName: "Grace" } });
		expect(identityFieldsEqual(a, b)).toBe(true);
		expect(identityFieldsEqual(a, c)).toBe(false);
	});
});
