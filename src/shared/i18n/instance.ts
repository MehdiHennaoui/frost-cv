import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { useEffect } from "react";
import { initReactI18next, useTranslation } from "react-i18next";

import { en } from "./locales/en";
import { fr } from "./locales/fr";
import { isUiLocale, UI_LOCALES, type UiLocale } from "./ui-locale";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "translation";
		resources: {
			translation: typeof en;
		};
	}
}

function readStoredUiLocale(): UiLocale | null {
	if (typeof localStorage === "undefined") return null;
	const stored = localStorage.getItem("i18nextLng");
	return stored && isUiLocale(stored) ? stored : null;
}

// Captured before init: the detector cache writes the forced `en` into
// localStorage and would erase the user's locale before React mounts.
const storedUiLocale = readStoredUiLocale();

void i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: { translation: en },
			fr: { translation: fr },
		},
		fallbackLng: "en",
		// localStorage is empty on the server. Detecting it during init makes the client
		// render a different language than the HTML and hydration fails.
		lng: "en",
		supportedLngs: [...UI_LOCALES, "cimode"],
		load: "currentOnly",
		interpolation: { escapeValue: false },
		react: { useSuspense: false },
		detection: {
			order: ["localStorage"],
			caches: ["localStorage"],
			lookupLocalStorage: "i18nextLng",
		},
	});

export async function changeUiLocale(locale: UiLocale): Promise<void> {
	await i18n.changeLanguage(locale);
}

export function useAppTranslation() {
	return useTranslation();
}

export function useStoredUiLocale(): void {
	useEffect(() => {
		const stored = storedUiLocale ?? readStoredUiLocale();
		if (!stored || stored === i18n.language) return;
		// The shell hydrates before client-only routes. Switching language in this
		// effect re-renders those routes before they hydrate.
		const id = window.setTimeout(() => {
			void i18n.changeLanguage(stored);
		}, 0);
		return () => window.clearTimeout(id);
	}, []);
}

export function useUiLocale(): UiLocale {
	const { i18n: instance } = useTranslation();
	return isUiLocale(instance.language) ? instance.language : "en";
}

export { i18n };
