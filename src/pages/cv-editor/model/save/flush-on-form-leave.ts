/** Focus that stays inside the editor chrome keeps the 1s debounce. */
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
	const chrome = event?.currentTarget.closest("[data-editor-chrome]");
	if (next instanceof Node && chrome?.contains(next)) {
		return;
	}
	flush();
}
