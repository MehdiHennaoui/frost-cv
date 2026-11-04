import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";

const inputVariants = cva(
	"h-9 w-full min-w-0 rounded-md border border-input px-2.5 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
	{
		variants: {
			variant: {
				default: "bg-transparent dark:bg-input/30",
				surface: "bg-background",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Input({
	className,
	type,
	variant = "default",
	...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn(inputVariants({ variant, className }))}
			{...props}
		/>
	);
}

export { Input, inputVariants };
