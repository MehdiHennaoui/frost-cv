import { useEffect } from "react";

import { useAppTranslation } from "./instance";
import { readUiLocale } from "./ui-locale";

export function UiLocaleSync() {
	const { i18n } = useAppTranslation();

	useEffect(() => {
		function syncDocumentLanguage(language: string) {
			document.documentElement.lang = language;
		}

		const stored = readUiLocale();
		syncDocumentLanguage(stored);
		i18n.on("languageChanged", syncDocumentLanguage);
		if (i18n.language !== stored) {
			void i18n.changeLanguage(stored);
		}

		return () => {
			i18n.off("languageChanged", syncDocumentLanguage);
		};
	}, [i18n]);

	return null;
}
