import { useRef, useState } from "react";

import type { Cv, CvContent } from "@/entities/cv";
import { moveEntryTo, removeEntry } from "./entry-list";
import { useCvAutosave } from "./use-cv-autosave";

type UseCvEntryListOptions<T extends { id: string }> = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
	initial: T[];
	isEqual: (a: T[], b: T[]) => boolean;
	apply: (content: CvContent, value: T[]) => CvContent;
	canSave?: (value: T[]) => boolean;
	createEmpty: () => T;
};

/** List section state on top of `useCvAutosave`: commit, patch, add, move, delete. */
export function useCvEntryList<T extends { id: string }>({
	cv,
	onPersisted,
	initial,
	isEqual,
	apply,
	canSave,
	createEmpty,
}: UseCvEntryListOptions<T>) {
	const [entries, setEntries] = useState(initial);
	const draftRef = useRef(initial);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

	const autosave = useCvAutosave({
		cv,
		onPersisted,
		initialSaved: initial,
		isEqual,
		apply,
		canSave,
	});

	function commit(next: T[], options?: { flush?: boolean }) {
		draftRef.current = next;
		setEntries(next);
		autosave.schedule(next);
		if (options?.flush) {
			autosave.flush();
		}
	}

	function patchEntry(id: string, patch: Partial<T>) {
		commit(
			draftRef.current.map((entry) =>
				entry.id === id ? { ...entry, ...patch } : entry,
			),
		);
	}

	function handleAdd() {
		commit([...draftRef.current, createEmpty()], { flush: true });
	}

	function moveEntry(id: string, toIndex: number) {
		commit(moveEntryTo(draftRef.current, id, toIndex), { flush: true });
	}

	function requestDelete(id: string) {
		setPendingDeleteId(id);
	}

	function cancelDelete() {
		setPendingDeleteId(null);
	}

	function confirmDelete() {
		if (!pendingDeleteId) {
			return;
		}
		const id = pendingDeleteId;
		setPendingDeleteId(null);
		commit(removeEntry(draftRef.current, id), { flush: true });
	}

	const pendingDelete = pendingDeleteId
		? draftRef.current.find((entry) => entry.id === pendingDeleteId)
		: undefined;

	return {
		entries,
		pendingDelete,
		patchEntry,
		flush: autosave.flush,
		handleAdd,
		moveEntry,
		requestDelete,
		cancelDelete,
		confirmDelete,
	};
}
