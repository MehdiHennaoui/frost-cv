/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useEntryCollapse } from "./use-entry-collapse";

afterEach(() => {
	cleanup();
});

describe("useEntryCollapse", () => {
	it("starts with every entry collapsed", () => {
		const { result } = renderHook(() => useEntryCollapse());

		expect(result.current.isExpanded("a")).toBe(false);
		expect(result.current.isExpanded("b")).toBe(false);
	});

	it("toggles expand and collapse for one entry id", () => {
		const { result } = renderHook(() => useEntryCollapse());

		act(() => {
			result.current.toggle("a");
		});
		expect(result.current.isExpanded("a")).toBe(true);
		expect(result.current.isExpanded("b")).toBe(false);

		act(() => {
			result.current.toggle("a");
		});
		expect(result.current.isExpanded("a")).toBe(false);
	});
});
