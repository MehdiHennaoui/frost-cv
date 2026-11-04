import { useSelector } from "@tanstack/react-form";
import {
	createContext,
	type ReactNode,
	type RefObject,
	useContext,
} from "react";

import type { Cv } from "@/entities/cv";
import { flushOnFormLeave } from "../save/flush-on-form-leave";
import type { EditorFormValues } from "./editor-form-values";
import {
	type EditorFormApi,
	useEditorFormApi,
	useEditorFormAutosave,
} from "./use-editor-form-autosave";

type EditorFormContextValue = {
	form: EditorFormApi;
	/** Call after any edit (input, add, delete, reorder). Debounces ~1s then saves. */
	schedule: () => void;
	/** Call when leaving the form or the page. Saves now. */
	flush: () => void;
};

const EditorFormContext = createContext<EditorFormContextValue | null>(null);

export function useEditorForm(): EditorFormContextValue {
	const value = useContext(EditorFormContext);
	if (!value) {
		throw new Error("useEditorForm requires EditorFormProvider");
	}
	return value;
}

/** UI re-renders only. Autosave is driven by schedule/flush actions, not this. */
export function useEditorValues(): EditorFormValues {
	const { form } = useEditorForm();
	return useSelector(form.store, (state) => state.values);
}

type EditorFormProviderProps = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
	children: ReactNode;
	/** Set false before a replace-import remount so the outgoing draft does not write over the import. */
	flushOnUnmountRef?: RefObject<boolean>;
};

export function EditorFormProvider({
	cv,
	onPersisted,
	children,
	flushOnUnmountRef,
}: EditorFormProviderProps) {
	const form = useEditorFormApi(cv);
	const { schedule, flush } = useEditorFormAutosave(form, {
		cv,
		onPersisted,
		flushOnUnmountRef,
	});

	return (
		<EditorFormContext.Provider value={{ form, schedule, flush }}>
			<form
				onSubmit={(event) => {
					event.preventDefault();
				}}
				onBlur={(event) => {
					flushOnFormLeave(event, flush);
				}}
			>
				{children}
			</form>
		</EditorFormContext.Provider>
	);
}
