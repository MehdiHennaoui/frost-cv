import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

import { en } from "./locales/en";
import { frCA } from "./locales/fr-CA";
import { type UiLocale, writeUiLocale } from "./ui-locale";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "translation";
		resources: {
			translation: typeof en;
		};
	}
}

void i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		"fr-CA": { translation: frCA },
	},
	lng: "en",
	fallbackLng: "en",
	supportedLngs: ["en", "fr-CA"],
	load: "currentOnly",
	interpolation: { escapeValue: false },
	react: { useSuspense: false },
});

export async function changeUiLocale(locale: UiLocale): Promise<void> {
	writeUiLocale(locale);
	await i18n.changeLanguage(locale);
}

export function useAppTranslation() {
	return useTranslation();
}

export { i18n };
