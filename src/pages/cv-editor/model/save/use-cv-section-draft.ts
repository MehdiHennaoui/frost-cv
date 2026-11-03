import { useRef, useState } from "react";

import type { Cv, CvContent } from "@/entities/cv";
import { useCvAutosave } from "./use-cv-autosave";

type UseCvSectionDraftOptions<T extends object> = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
	initial: T;
	isEqual?: (a: T, b: T) => boolean;
	apply: (content: CvContent, value: T) => CvContent;
	canSave?: (value: T) => boolean;
};

export function useCvSectionDraft<T extends object>({
	cv,
	onPersisted,
	initial,
	isEqual,
	apply,
	canSave,
}: UseCvSectionDraftOptions<T>) {
	const draftRef = useRef(initial);
	const [draft, setDraft] = useState(initial);
	const autosave = useCvAutosave({
		cv,
		onPersisted,
		initialSaved: initial,
		isEqual,
		apply,
		canSave,
	});

	function schedule(patch: Partial<T>) {
		const next = { ...draftRef.current, ...patch };
		draftRef.current = next;
		setDraft(next);
		autosave.schedule(next);
	}

	return {
		draft,
		schedule,
		flush: autosave.flush,
		cancel: autosave.cancel,
	};
}
