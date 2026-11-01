import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { buttonVariants } from "@/shared/ui/button";
import { Link } from "@/shared/ui/link";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/ui/tooltip";

type IconTooltipLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
	label: string;
	children: ReactNode;
};

export function IconTooltipLink({
	label,
	className,
	children,
	...props
}: IconTooltipLinkProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger
					render={
						<Link
							aria-label={label}
							className={cn(
								buttonVariants({ variant: "ghost", size: "icon-sm" }),
								className,
							)}
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
