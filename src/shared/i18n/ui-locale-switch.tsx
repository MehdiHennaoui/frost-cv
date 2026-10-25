import { LanguagesIcon } from "lucide-react";
import type { ChangeEvent } from "react";

import { Field, FieldLabel } from "@/shared/ui/field";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import { changeUiLocale, useAppTranslation, useUiLocale } from "./instance";
import { isUiLocale } from "./ui-locale";

export function UiLocaleSwitch() {
	const { t } = useAppTranslation();
	const value = useUiLocale();

	function handleChange(event: ChangeEvent<HTMLSelectElement>) {
		const next = event.target.value;
		if (!isUiLocale(next)) {
			return;
		}
		void changeUiLocale(next);
	}

	return (
		<Field className="w-auto">
			<FieldLabel htmlFor="ui-locale">
				<LanguagesIcon aria-hidden className="size-4" />
				{t("uiLocale.label")}
			</FieldLabel>
			<NativeSelect id="ui-locale" value={value} onChange={handleChange}>
				<NativeSelectOption value="en">
					{t("uiLocale.option.en")}
				</NativeSelectOption>
				<NativeSelectOption value="fr">
					{t("uiLocale.option.fr")}
				</NativeSelectOption>
			</NativeSelect>
		</Field>
	);
}
