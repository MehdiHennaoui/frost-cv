import type * as React from "react";

import { cn } from "@/shared/lib/cn";
import { Input } from "@/shared/ui/input";
import { currentMonthValue } from "../../model/helpers/month-year";

type MonthInputProps = Omit<React.ComponentProps<typeof Input>, "type" | "max">;

/** Month field: whole control opens the picker; capped at the current month. Icon stays native. */
export function MonthInput({
	className,
	onClick,
	variant = "surface",
	...props
}: MonthInputProps) {
	return (
		<Input
			{...props}
			type="month"
			variant={variant}
			max={currentMonthValue()}
			className={cn("cursor-pointer", className)}
			onClick={(event) => {
				onClick?.(event);
				if (event.defaultPrevented) {
					return;
				}
				try {
					event.currentTarget.showPicker?.();
				} catch {
					// showPicker throws when the browser rejects the call
				}
			}}
		/>
	);
}
