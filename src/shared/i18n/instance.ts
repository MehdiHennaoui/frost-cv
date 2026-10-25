import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
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

void i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: { translation: en },
			fr: { translation: fr },
		},
		fallbackLng: "en",
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

export function useUiLocale(): UiLocale {
	const { i18n: instance } = useTranslation();
	return isUiLocale(instance.language) ? instance.language : "en";
}

export { i18n };
