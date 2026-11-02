import type { ComponentProps } from "react";

import { Button } from "@/shared/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/ui/tooltip";

type IconTooltipButtonProps = ComponentProps<typeof Button> & {
	label: string;
};

export function IconTooltipButton({
	label,
	children,
	variant = "outline",
	...props
}: IconTooltipButtonProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							type="button"
							size="icon-sm"
							variant={variant}
							aria-label={label}
							{...props}
						/>
					}
				>
					{children}
				</TooltipTrigger>
				<TooltipContent>{label}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
