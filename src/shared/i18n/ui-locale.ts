/**
 * UI locale preference.
 *
 * Stored in localStorage under `frost-cv.ui-locale` when storage is available.
 * Missing or unknown values default to `en`. The app shell starts in English
 * and applies the stored locale after mount so server and client markup match.
 */

export const UI_LOCALES = ["en", "fr-CA"] as const;

export type UiLocale = (typeof UI_LOCALES)[number];

export const DEFAULT_UI_LOCALE: UiLocale = "en";

export const UI_LOCALE_STORAGE_KEY = "frost-cv.ui-locale";

export function isUiLocale(value: string): value is UiLocale {
	return value === "en" || value === "fr-CA";
}

export function readUiLocale(): UiLocale {
	if (typeof window === "undefined") {
		return DEFAULT_UI_LOCALE;
	}

	try {
		const stored = window.localStorage.getItem(UI_LOCALE_STORAGE_KEY);
		if (stored && isUiLocale(stored)) {
			return stored;
		}
	} catch {
		return DEFAULT_UI_LOCALE;
	}

	return DEFAULT_UI_LOCALE;
}

export function writeUiLocale(locale: UiLocale): void {
	if (typeof window === "undefined") {
		return;
	}

	try {
		window.localStorage.setItem(UI_LOCALE_STORAGE_KEY, locale);
	} catch {
		// Storage can be blocked; the in-memory language still applies this session.
	}
}
