import { createElement, type ReactNode } from "react";
import { beforeEach, vi } from "vitest";

import { useTranslationKeys } from "@/shared/i18n";

vi.mock("@/shared/ui/link", () => ({
	Link: ({
		children,
		to,
		params,
		className,
		...props
	}: {
		children?: ReactNode;
		to: string;
		params?: Record<string, string>;
		className?: string;
	}) => {
		let href = to;
		if (params) {
			for (const [key, value] of Object.entries(params)) {
				href = href.replace(`$${key}`, value);
			}
		}
		return createElement("a", { href, className, ...props }, children);
	},
}));

beforeEach(async () => {
	await useTranslationKeys();
});
