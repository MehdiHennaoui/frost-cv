import { useForm } from "@tanstack/react-form";
import { type RefObject, useRef } from "react";
import { useEventCallback, useIsMounted, useUnmount } from "usehooks-ts";

import { type Cv, saveCv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { createAutosave } from "@/shared/lib/autosave";
import { toast } from "@/shared/ui/toast";
import { useWithCvSavePending } from "../save/cv-save-pending";
import { editorFormSchema } from "./editor-form-schema";
import {
	type EditorFormValues,
	editorContentFromValues,
	editorFormValuesOf,
} from "./editor-form-values";

export function useEditorFormApi(cv: Cv) {
	return useForm({
		defaultValues: editorFormValuesOf(cv.content),
		validators: {
			onChange: editorFormSchema,
		},
	});
}

export type EditorFormApi = ReturnType<typeof useEditorFormApi>;

function sameValues(a: EditorFormValues, b: EditorFormValues) {
	return JSON.stringify(a) === JSON.stringify(b);
}

export function useEditorFormAutosave(
	form: EditorFormApi,
	{
		cv,
		onPersisted,
		flushOnUnmountRef,
	}: {
		cv: Cv;
		onPersisted: (cv: Cv) => void;
		flushOnUnmountRef?: RefObject<boolean>;
	},
) {
	const { t } = useAppTranslation();
	const withCvSavePending = useWithCvSavePending();
	const isMounted = useIsMounted();
	const invalidEpisodeRef = useRef(false);

	const persist = useEventCallback(async (next: EditorFormValues) => {
		if (!form.state.isFormValid) {
			console.error(form.state.errorMap.onChange);
			if (!invalidEpisodeRef.current) {
				invalidEpisodeRef.current = true;
				toast.add({
					type: "error",
					title: t("cvEditor.save.invalid"),
				});
			}
			return false;
		}
		invalidEpisodeRef.current = false;
		try {
			let saved: Cv | undefined;
			await withCvSavePending(async () => {
				saved = await saveCv({
					...cv,
					content: editorContentFromValues(cv.content, next),
				});
			});
			if (!saved) {
				return false;
			}
			if (isMounted()) {
				onPersisted(saved);
			}
		} catch (error) {
			console.error(error);
			toast.add({
				type: "error",
				title: t("cvEditor.save.failed"),
			});
			return false;
		}
	});

	const autosaveRef = useRef<ReturnType<
		typeof createAutosave<EditorFormValues>
	> | null>(null);
	if (!autosaveRef.current) {
		autosaveRef.current = createAutosave({
			initialSaved: form.state.values,
			isEqual: sameValues,
			save: (next) => persist(next),
		});
	}
	const autosave = autosaveRef.current;

	const schedule = useEventCallback(() => {
		if (form.state.isFormValid) {
			invalidEpisodeRef.current = false;
		}
		autosave.schedule(form.state.values);
	});

	const flush = useEventCallback(() => {
		autosave.schedule(form.state.values);
		void autosave.flush();
	});

	useUnmount(() => {
		if (flushOnUnmountRef && !flushOnUnmountRef.current) {
			return;
		}
		flush();
	});

	return { schedule, flush };
}
