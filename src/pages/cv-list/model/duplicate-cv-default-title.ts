import type { AppLocale } from "@/shared/i18n";

export function duplicateCvDefaultTitle(
	sourceTitle: string,
	uiLocale: AppLocale,
): string {
	const suffix = uiLocale === "fr" ? " (copie)" : " (copy)";
	return `${sourceTitle}${suffix}`;
}
