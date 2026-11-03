/** @vitest-environment jsdom */

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { RichTextEditor } from "./rich-text-editor";

afterEach(() => {
	cleanup();
});

describe("RichTextEditor", () => {
	it("restores ul/ol markers overridden by Tailwind preflight", async () => {
		render(
			<RichTextEditor
				value="<ul><li>one</li></ul>"
				onChange={() => undefined}
			/>,
		);

		const surface = await waitFor(() => {
			const el = document.querySelector(".ProseMirror");
			expect(el).toBeTruthy();
			return el as HTMLElement;
		});

		expect(surface.className).toContain("[&_ul]:list-disc");
		expect(surface.className).toContain("[&_ol]:list-decimal");
		expect(surface.className).toContain("[&_ul]:pl-5");
		expect(surface.className).toContain("[&_ol]:pl-5");
	});
});
