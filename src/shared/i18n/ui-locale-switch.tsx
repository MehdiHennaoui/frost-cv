import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { changeUiLocale, useAppTranslation, useUiLocale } from "./instance";
import type { UiLocale } from "./ui-locale";

const LOCALE_OPTIONS: {
	locale: UiLocale;
	flag: string;
	/** Native name — not i18n’d so it stays recognizable in every UI locale. */
	label: string;
}[] = [
	{ locale: "en", flag: "🇬🇧", label: "English" },
	{ locale: "fr", flag: "🇫🇷", label: "Français" },
];

export function UiLocaleSwitch() {
	const { t } = useAppTranslation();
	const value = useUiLocale();
	const selected =
		LOCALE_OPTIONS.find((option) => option.locale === value) ??
		LOCALE_OPTIONS[0];

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
				<span aria-hidden className="text-base leading-none">
					{selected.flag}
				</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{LOCALE_OPTIONS.map(({ locale, flag, label }) => {
					const isSelected = locale === value;
					return (
						<DropdownMenuItem
							key={locale}
							onClick={() => handleSelect(locale)}
							data-active={isSelected ? "" : undefined}
						>
							<span aria-hidden>{flag}</span>
							<span className={cn({ "font-bold": isSelected })}>{label}</span>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
