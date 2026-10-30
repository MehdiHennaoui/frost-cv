import { ArrowUpDownIcon, CheckIcon } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/ui/tooltip";

type PositionMenuProps = {
	label: string;
	index: number;
	count: number;
	onMove: (toIndex: number) => void;
	optionLabel: (position: number) => string;
};

export function PositionMenu({
	label,
	index,
	count,
	onMove,
	optionLabel,
}: PositionMenuProps) {
	return (
		<TooltipProvider>
			<DropdownMenu>
				<Tooltip>
					<TooltipTrigger
						render={
							<DropdownMenuTrigger
								render={
									<Button
										type="button"
										size="icon-sm"
										variant="ghost"
										disabled={count < 2}
										aria-label={label}
									/>
								}
							/>
						}
					>
						<ArrowUpDownIcon />
					</TooltipTrigger>
					<TooltipContent>{label}</TooltipContent>
				</Tooltip>
				<DropdownMenuContent className="w-48">
					<DropdownMenuGroup>
						{Array.from({ length: count }, (_, position) => {
							const selected = position === index;
							return (
								<DropdownMenuItem
									// biome-ignore lint/suspicious/noArrayIndexKey: the position number is the item
									key={position}
									className={cn({ "font-bold": selected })}
									aria-current={selected ? "true" : undefined}
									onClick={() => onMove(position)}
								>
									<span className="flex size-4 items-center justify-center">
										{selected && <CheckIcon />}
									</span>
									{optionLabel(position)}
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</TooltipProvider>
	);
}
