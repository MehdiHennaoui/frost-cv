import { useLayoutEffect, useRef, useState } from "react";

const MIN_HEIGHT_PX = 96;
const MAX_HEIGHT_PX = 320;

function clampHeight(height: number): number {
	return Math.min(MAX_HEIGHT_PX, Math.max(MIN_HEIGHT_PX, height));
}

/**
 * Sizes a box to its content on first layout / content changes (capped),
 * then keeps a manual CSS resize once the user drags the handle.
 */
export function useResizableContentHeight(contentKey: string | undefined) {
	const ref = useRef<HTMLDivElement>(null);
	const userResizedRef = useRef(false);
	const fittingRef = useRef(false);
	const [heightPx, setHeightPx] = useState<number | undefined>(undefined);

	useLayoutEffect(() => {
		const el = ref.current;
		if (contentKey === undefined || !el || userResizedRef.current) {
			return;
		}

		fittingRef.current = true;
		const previousHeight = el.style.height;
		el.style.height = "auto";
		const measured = clampHeight(el.scrollHeight);
		el.style.height = previousHeight;
		setHeightPx(measured);
		queueMicrotask(() => {
			fittingRef.current = false;
		});
	}, [contentKey]);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el || typeof ResizeObserver === "undefined") {
			return;
		}

		const observer = new ResizeObserver((entries) => {
			if (fittingRef.current || userResizedRef.current) {
				return;
			}
			const next = entries[0]?.contentRect.height;
			if (next == null || heightPx == null) {
				return;
			}
			if (Math.abs(next - heightPx) < 2) {
				return;
			}
			userResizedRef.current = true;
			setHeightPx(clampHeight(next));
		});

		observer.observe(el);
		return () => observer.disconnect();
	}, [heightPx]);

	return {
		ref,
		style: {
			minHeight: MIN_HEIGHT_PX,
			maxHeight: MAX_HEIGHT_PX,
			height: heightPx,
		} as const,
	};
}
