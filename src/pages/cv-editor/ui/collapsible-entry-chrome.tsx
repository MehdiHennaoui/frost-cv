import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";

import { IconTooltipButton } from "./icon-tooltip-button";

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
		<div className="space-y-3 rounded-lg border border-border bg-muted p-3">
			<div className="flex items-center gap-1">
				<div className="flex min-w-0 flex-1 items-center gap-1">
					<IconTooltipButton
						label={expanded ? collapseLabel : expandLabel}
						aria-expanded={expanded}
						onClick={onToggle}
					>
						{expanded ? (
							<ChevronDownIcon aria-hidden />
						) : (
							<ChevronRightIcon aria-hidden />
						)}
					</IconTooltipButton>
					{!expanded && (
						<p className="min-w-0 truncate font-medium text-sm">{scanLabel}</p>
					)}
				</div>
				<div className="flex shrink-0 items-center gap-1">{actions}</div>
			</div>
			{expanded && children}
		</div>
	);
}
