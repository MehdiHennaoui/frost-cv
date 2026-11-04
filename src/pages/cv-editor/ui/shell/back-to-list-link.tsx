import { ArrowLeftIcon } from "lucide-react";

import { useAppTranslation } from "@/shared/i18n";
import { useIsMobile } from "@/shared/lib/use-mobile";
import { buttonVariants } from "@/shared/ui/button";
import { Link } from "@/shared/ui/link";
import { IconTooltipLink } from "./icon-tooltip-link";

export function BackToListLink() {
	const { t } = useAppTranslation();
	const isMobile = useIsMobile();
	const label = t("cvEditor.backToList");

	if (isMobile) {
		return (
			<IconTooltipLink label={label} to="/cvs">
				<ArrowLeftIcon />
			</IconTooltipLink>
		);
	}

	return (
		<Link
			to="/cvs"
			className={buttonVariants({ variant: "outline", size: "sm" })}
		>
			<ArrowLeftIcon data-icon="inline-start" />
			{label}
		</Link>
	);
}
