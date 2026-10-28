/** Locales available for UI and CV content — keep these in sync everywhere. */
export const APP_LOCALES = ["en", "fr"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export function isAppLocale(value: string): value is AppLocale {
	return (APP_LOCALES as readonly string[]).includes(value);
}
