/** @vitest-environment jsdom */

import { describe, expect, it, vi } from "vitest";

import { flushOnFormLeave } from "./flush-on-form-leave";

describe("flushOnFormLeave", () => {
	it("skips flush when focus stays inside the form", () => {
		const form = document.createElement("form");
		const from = document.createElement("input");
		const to = document.createElement("input");
		form.append(from, to);
		const flush = vi.fn();

		flushOnFormLeave({ currentTarget: from, relatedTarget: to }, flush);
		expect(flush).not.toHaveBeenCalled();

		flushOnFormLeave({ currentTarget: from, relatedTarget: null }, flush);
		expect(flush).toHaveBeenCalledOnce();
	});
});
