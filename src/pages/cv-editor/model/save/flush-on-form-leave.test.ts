/** @vitest-environment jsdom */

import { describe, expect, it, vi } from "vitest";

import { flushOnFormLeave } from "./flush-on-form-leave";

describe("flushOnFormLeave", () => {
	it("skips flush when focus stays inside the editor chrome", () => {
		const chrome = document.createElement("div");
		chrome.setAttribute("data-editor-chrome", "");
		const form = document.createElement("form");
		const from = document.createElement("input");
		const button = document.createElement("button");
		chrome.append(form, button);
		form.append(from);
		const flush = vi.fn();

		flushOnFormLeave({ currentTarget: form, relatedTarget: button }, flush);
		expect(flush).not.toHaveBeenCalled();

		flushOnFormLeave({ currentTarget: form, relatedTarget: null }, flush);
		expect(flush).toHaveBeenCalledOnce();
	});
});
