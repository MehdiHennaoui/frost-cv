export type AutosaveOptions<T> = {
	save: (value: T) => void | Promise<void>;
	delayMs?: number;
	isEqual?: (a: T, b: T) => boolean;
	/** Treat as already persisted so flush/schedule skips until a real change. */
	initialSaved?: T;
};

export type Autosave<T> = {
	schedule: (value: T) => void;
	flush: () => Promise<void>;
	cancel: () => void;
};

/** Debounced save with immediate flush (blur / leave route). */
export function createAutosave<T>({
	save,
	delayMs = 1000,
	isEqual = Object.is,
	initialSaved,
}: AutosaveOptions<T>): Autosave<T> {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let pending: T | undefined;
	let hasPending = false;
	let lastSaved: T | undefined = initialSaved;
	let hasLastSaved = initialSaved !== undefined;
	let chain: Promise<void> = Promise.resolve();

	function clearTimer() {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function schedule(value: T) {
		pending = value;
		hasPending = true;
		clearTimer();
		timer = setTimeout(() => {
			timer = null;
			void flush();
		}, delayMs);
	}

	async function flush() {
		clearTimer();
		if (!hasPending) {
			return;
		}
		const value = pending as T;
		pending = undefined;
		hasPending = false;

		if (hasLastSaved && isEqual(lastSaved as T, value)) {
			return;
		}

		chain = chain.then(async () => {
			await save(value);
			lastSaved = value;
			hasLastSaved = true;
		});
		await chain;
	}

	function cancel() {
		clearTimer();
		pending = undefined;
		hasPending = false;
	}

	return { schedule, flush, cancel };
}
