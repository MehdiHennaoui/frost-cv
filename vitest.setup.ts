import { beforeEach } from "vitest";

import { useTranslationKeys } from "@/shared/i18n";

beforeEach(async () => {
	await useTranslationKeys();
});
