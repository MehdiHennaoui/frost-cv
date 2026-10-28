import { useEffect, useEffectEvent, useRef } from "react";

import { type Cv, type CvContent, saveCv } from "@/entities/cv";
import { createAutosave } from "@/shared/lib/autosave";

type UseCvAutosaveOptions<T> = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
	initialSaved: T;
	isEqual?: (a: T, b: T) => boolean;
	apply: (content: CvContent, value: T) => CvContent;
	/** When false, schedule / flush / leave cancel instead of saving. */
	canSave?: (value: T) => boolean;
};

/** Debounced CV section persist: 1s idle, flush on blur/leave, optional validity gate. */
export function useCvAutosave<T>({
	cv,
	onPersisted,
	initialSaved,
	isEqual,
	apply,
	canSave = () => true,
}: UseCvAutosaveOptions<T>) {
	const latestRef = useRef(initialSaved);

	const persist = useEffectEvent(async (value: T) => {
		const next = await saveCv({
			...cv,
			content: apply(cv.content, value),
		});
		onPersisted(next);
	});

	const allowSave = useEffectEvent((value: T) => canSave(value));

	const autosaveRef = useRef(
		createAutosave<T>({
			initialSaved,
			isEqual,
			save: (value) => persist(value),
		}),
	);

	useEffect(() => {
		const autosave = autosaveRef.current;
		return () => {
			if (!allowSave(latestRef.current)) {
				autosave.cancel();
				return;
			}
			void autosave.flush();
		};
	}, []);

	function schedule(value: T) {
		latestRef.current = value;
		if (!allowSave(value)) {
			autosaveRef.current.cancel();
			return;
		}
		autosaveRef.current.schedule(value);
	}

	function flush() {
		if (!allowSave(latestRef.current)) {
			autosaveRef.current.cancel();
			return;
		}
		void autosaveRef.current.flush();
	}

	function cancel() {
		autosaveRef.current.cancel();
	}

	return { schedule, flush, cancel };
}
