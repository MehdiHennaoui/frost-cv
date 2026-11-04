/** Focus that stays inside the form keeps the 1s debounce. */
export function flushOnFormLeave(
	event:
		| {
				currentTarget: HTMLElement;
				relatedTarget: EventTarget | null;
		  }
		| undefined,
	flush: () => void,
) {
	const next = event?.relatedTarget;
	const form = event?.currentTarget.closest("form");
	if (next instanceof Node && form?.contains(next)) {
		return;
	}
	flush();
}
