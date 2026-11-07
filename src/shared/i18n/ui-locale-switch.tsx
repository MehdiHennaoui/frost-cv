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
	/** Native name — not i18n’d so it stays recognizable in every UI locale. */
	label: string;
}[] = [
	{ locale: "en", label: "English" },
	{ locale: "fr", label: "Français" },
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
						variant="outline"
						size="icon"
						aria-label={t("uiLocale.label")}
					/>
				}
			>
				<span aria-hidden className="font-semibold text-xs uppercase">
					{selected.locale}
				</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{LOCALE_OPTIONS.map(({ locale, label }) => {
					const isSelected = locale === value;
					return (
						<DropdownMenuItem
							key={locale}
							onClick={() => handleSelect(locale)}
							data-active={isSelected ? "" : undefined}
						>
							<span className={cn({ "font-bold": isSelected })}>{label}</span>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
