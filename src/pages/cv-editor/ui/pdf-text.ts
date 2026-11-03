const TEXT = {
	xs: { fontSize: 9, lineHeight: 16 / 12 },
	sm: { fontSize: 10.5, lineHeight: 20 / 14 },
	base: { fontSize: 12, lineHeight: 24 / 16 },
	"2xl": { fontSize: 18, lineHeight: 32 / 24 },
} as const;

/** Tailwind-like `spacing` scale in pt (space-1 … space-6). */
export const space = {
	1: 4,
	2: 8,
	3: 12,
	4: 16,
	5: 20,
	6: 24,
} as const;

export type PdfTextSize = keyof typeof TEXT;

/** Tailwind-like `text-*`: fontSize + matching lineHeight together. */
export function text(size: PdfTextSize) {
	return TEXT[size];
}
