import { useForm } from "@tanstack/react-form";
import {
	createContext,
	type ReactNode,
	type RefObject,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

import { type Cv, saveCv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { createAutosave } from "@/shared/lib/autosave";
import { toast } from "@/shared/ui/toast";
import { useWithCvSavePending } from "../save/cv-save-pending";
import { flushOnFormLeave } from "../save/flush-on-form-leave";
import { editorFormSchema } from "./editor-form-schema";
import {
	type EditorFormValues,
	editorContentFromValues,
	editorFormValuesOf,
} from "./editor-form-values";

type EditorFormApi = ReturnType<typeof useEditorFormApi>;

type EditorFormContextValue = {
	form: EditorFormApi;
	flush: () => void;
};

const EditorFormContext = createContext<EditorFormContextValue | null>(null);

function useEditorFormApi(cv: Cv) {
	return useForm({
		defaultValues: editorFormValuesOf(cv.content),
		validators: {
			onChange: editorFormSchema,
		},
	});
}

export function useEditorForm(): EditorFormContextValue {
	const value = useContext(EditorFormContext);
	if (!value) {
		throw new Error("useEditorForm requires EditorFormProvider");
	}
	return value;
}

export function useEditorValues(): EditorFormValues {
	const { form } = useEditorForm();
	const [values, setValues] = useState(form.state.values);

	useEffect(() => {
		const subscription = form.store.subscribe(() => {
			const next = form.state.values;
			setValues((current) => (current === next ? current : next));
		});
		return () => {
			subscription.unsubscribe();
		};
	}, [form]);

	return values;
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
	const { t } = useAppTranslation();
	const form = useEditorFormApi(cv);
	const withCvSavePending = useWithCvSavePending();
	const cvRef = useRef(cv);
	const onPersistedRef = useRef(onPersisted);
	const tRef = useRef(t);
	cvRef.current = cv;
	onPersistedRef.current = onPersisted;
	tRef.current = t;

	const autosaveRef = useRef<ReturnType<typeof createAutosave<number>> | null>(
		null,
	);
	const revisionRef = useRef(0);
	const savedJsonRef = useRef(JSON.stringify(form.state.values));
	const invalidEpisodeRef = useRef(false);
	const activeRef = useRef(true);

	if (!autosaveRef.current) {
		const autosave = createAutosave<number>({
			isEqual: () => false,
			save: async () => {
				// Fire time, not the scheduled snapshot: a newer invalid edit must not be overwritten.
				const values = form.state.values;
				const json = JSON.stringify(values);
				if (json === savedJsonRef.current) {
					return;
				}
				if (!form.state.isFormValid) {
					console.error(form.state.errorMap.onChange);
					if (!invalidEpisodeRef.current) {
						invalidEpisodeRef.current = true;
						toast.add({
							type: "error",
							title: tRef.current("cvEditor.save.invalid"),
						});
					}
					return;
				}
				invalidEpisodeRef.current = false;
				const current = cvRef.current;
				try {
					await withCvSavePending(async () => {
						const next = await saveCv({
							...current,
							content: editorContentFromValues(current.content, values),
						});
						if (!next) {
							return;
						}
						savedJsonRef.current = json;
						if (activeRef.current) {
							onPersistedRef.current(next);
						}
					});
				} catch (error) {
					console.error(error);
					toast.add({
						type: "error",
						title: tRef.current("cvEditor.save.failed"),
					});
				}
			},
		});
		autosaveRef.current = autosave;
	}

	function schedule() {
		revisionRef.current += 1;
		autosaveRef.current?.schedule(revisionRef.current);
	}

	function flush() {
		schedule();
		void autosaveRef.current?.flush();
	}

	const scheduleRef = useRef(schedule);
	scheduleRef.current = schedule;

	useEffect(() => {
		activeRef.current = true;
		savedJsonRef.current = JSON.stringify(form.state.values);
		let previous = form.state.values;
		const subscription = form.store.subscribe((state) => {
			if (state.isFormValid) {
				invalidEpisodeRef.current = false;
			}
			if (state.values === previous) {
				return;
			}
			previous = state.values;
			scheduleRef.current();
		});
		return () => {
			activeRef.current = false;
			subscription.unsubscribe();
			if (flushOnUnmountRef && !flushOnUnmountRef.current) {
				return;
			}
			const json = JSON.stringify(form.state.values);
			if (json === savedJsonRef.current) {
				return;
			}
			scheduleRef.current();
			void autosaveRef.current?.flush();
		};
	}, [form, flushOnUnmountRef]);

	return (
		<EditorFormContext.Provider value={{ form, flush }}>
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
