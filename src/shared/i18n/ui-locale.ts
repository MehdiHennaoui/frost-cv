import { APP_LOCALES, type AppLocale, isAppLocale } from "./app-locale";

export const UI_LOCALES = APP_LOCALES;
export type UiLocale = AppLocale;

export function isUiLocale(value: string): value is UiLocale {
	return isAppLocale(value);
}
