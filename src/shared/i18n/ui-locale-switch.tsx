import type { ChangeEvent } from "react";

import { Label } from "@/shared/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import { changeUiLocale, useAppTranslation } from "./instance";
import { isUiLocale, UI_LOCALES, type UiLocale } from "./ui-locale";

const optionKey = {
	en: "uiLocale.option.en",
	"fr-CA": "uiLocale.option.fr-CA",
} as const;

export function UiLocaleSwitch() {
	const { t, i18n } = useAppTranslation();
	const value: UiLocale = isUiLocale(i18n.language) ? i18n.language : "en";

	function handleChange(event: ChangeEvent<HTMLSelectElement>) {
		const next = event.target.value;
		if (!isUiLocale(next)) {
			return;
		}
		void changeUiLocale(next);
	}

	return (
		<div className="flex flex-col gap-1">
			<Label htmlFor="ui-locale">{t("uiLocale.label")}</Label>
			<NativeSelect id="ui-locale" value={value} onChange={handleChange}>
				{UI_LOCALES.map((locale) => (
					<NativeSelectOption key={locale} value={locale}>
						{t(optionKey[locale])}
					</NativeSelectOption>
				))}
			</NativeSelect>
		</div>
	);
}
