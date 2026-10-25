import { describe, expect, it } from "vitest";

import { identityFieldsOf } from "./identity-fields";

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
