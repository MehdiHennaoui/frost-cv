import { i18n } from "./instance";

/** Unit tests assert i18n keys, not localized copy. */
export async function useTranslationKeys(): Promise<void> {
	await i18n.changeLanguage("cimode");
}
