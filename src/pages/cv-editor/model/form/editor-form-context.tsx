import { useSelector } from "@tanstack/react-form";
import { createContext, type ReactNode, useContext } from "react";

import type { Cv } from "@/entities/cv";
import { flushOnFormLeave } from "../save/flush-on-form-leave";
import type { EditorFormValues } from "./editor-form-values";
import {
	type EditorFormApi,
	useEditorFormAutosave,
} from "./use-editor-form-autosave";

type EditorFormContextValue = {
	form: EditorFormApi;
	flush: () => void;
	hydrateFromCv: (cv: Cv) => void;
};

const EditorFormContext = createContext<EditorFormContextValue | null>(null);

function useEditorFormContext(): EditorFormContextValue {
	const value = useContext(EditorFormContext);
	if (!value) {
		throw new Error("useEditorForm requires EditorFormProvider");
	}
	return value;
}

export function useEditorForm(): EditorFormApi {
	return useEditorFormContext().form;
}

export function useHydrateEditorForm(): (cv: Cv) => void {
	return useEditorFormContext().hydrateFromCv;
}

/** Re-render when form values change. Autosave is owned by useForm listeners. */
export function useEditorValues(): EditorFormValues {
	const form = useEditorForm();
	return useSelector(form.store, (state) => state.values);
}

type EditorFormProviderProps = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
	children: ReactNode;
};

export function EditorFormProvider({
	cv,
	onPersisted,
	children,
}: EditorFormProviderProps) {
	const { form, flush, hydrateFromCv } = useEditorFormAutosave(cv, onPersisted);

	return (
		<EditorFormContext.Provider value={{ form, flush, hydrateFromCv }}>
			{children}
		</EditorFormContext.Provider>
	);
}

/** DOM form shell — keep around fields (e.g. sidebar) so leave-flush sees them. */
export function EditorForm({ children }: { children: ReactNode }) {
	const { flush } = useEditorFormContext();

	return (
		<form
			className="flex flex-col gap-2"
			onSubmit={(event) => {
				event.preventDefault();
			}}
			onBlur={(event) => {
				flushOnFormLeave(event, flush);
			}}
		>
			{children}
		</form>
	);
}
