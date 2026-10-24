/** @vitest-environment jsdom */

import { afterEach, describe, expect, it } from "vitest";

import {
	readUiLocale,
	UI_LOCALE_STORAGE_KEY,
	writeUiLocale,
} from "./ui-locale";

afterEach(() => {
	localStorage.clear();
});

describe("readUiLocale", () => {
	it("defaults to English when nothing is stored", () => {
		expect(readUiLocale()).toBe("en");
	});

	it("returns a stored French UI locale", () => {
		writeUiLocale("fr-CA");

		expect(readUiLocale()).toBe("fr-CA");
		expect(localStorage.getItem(UI_LOCALE_STORAGE_KEY)).toBe("fr-CA");
	});

	it("ignores an unknown stored value", () => {
		localStorage.setItem(UI_LOCALE_STORAGE_KEY, "de");

		expect(readUiLocale()).toBe("en");
	});
});
