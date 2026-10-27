import { GlobeIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { changeUiLocale, useAppTranslation, useUiLocale } from "./instance";
import type { UiLocale } from "./ui-locale";

const LOCALE_OPTIONS: { locale: UiLocale; flag: string }[] = [
	{ locale: "en", flag: "🇬🇧" },
	{ locale: "fr", flag: "🇫🇷" },
];

export function UiLocaleSwitch() {
	const { t } = useAppTranslation();
	const value = useUiLocale();

	function handleSelect(locale: UiLocale) {
		if (locale === value) {
			return;
		}
		void changeUiLocale(locale);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label={t("uiLocale.label")}
					/>
				}
			>
				<GlobeIcon aria-hidden />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{LOCALE_OPTIONS.map(({ locale, flag }) => (
					<DropdownMenuItem
						key={locale}
						onClick={() => handleSelect(locale)}
						data-active={locale === value ? "" : undefined}
					>
						<span aria-hidden>{flag}</span>
						<span>{t(`uiLocale.option.${locale}`)}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
