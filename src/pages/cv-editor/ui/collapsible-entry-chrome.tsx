import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { buttonVariants } from "@/shared/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shared/ui/collapsible";

type CollapsibleEntryChromeProps = {
	expanded: boolean;
	onToggle: () => void;
	scanLabel: string;
	expandLabel: string;
	collapseLabel: string;
	actions: ReactNode;
	children: ReactNode;
};

export function CollapsibleEntryChrome({
	expanded,
	onToggle,
	scanLabel,
	expandLabel,
	collapseLabel,
	actions,
	children,
}: CollapsibleEntryChromeProps) {
	return (
		<Collapsible
			open={expanded}
			onOpenChange={(open) => {
				if (open !== expanded) {
					onToggle();
				}
			}}
			className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-3"
		>
			<div className="flex items-center gap-1">
				<CollapsibleTrigger
					aria-label={expanded ? collapseLabel : expandLabel}
					className={cn(
						buttonVariants({ variant: "outline", size: "sm" }),
						"h-8 min-w-0 flex-1 justify-start px-2",
					)}
				>
					{expanded ? (
						<ChevronDownIcon aria-hidden className="size-4 shrink-0" />
					) : (
						<ChevronRightIcon aria-hidden className="size-4 shrink-0" />
					)}
					<span className="min-w-0 truncate font-medium text-sm">
						{scanLabel}
					</span>
				</CollapsibleTrigger>
				<div className="flex shrink-0 items-center gap-1">{actions}</div>
			</div>
			<CollapsibleContent className="flex flex-col gap-3">
				{children}
			</CollapsibleContent>
		</Collapsible>
	);
}
