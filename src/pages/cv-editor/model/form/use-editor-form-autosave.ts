import { useForm } from "@tanstack/react-form";
import { useRef } from "react";
import { useUnmount } from "usehooks-ts";

import { type Cv, saveCv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { toast } from "@/shared/ui/toast";
import { useWithCvSavePending } from "../save/cv-save-pending";
import { editorFormSchema } from "./editor-form-schema";
import {
	editorContentFromValues,
	editorFormValuesOf,
} from "./editor-form-values";

type SaveFormApi = {
	state: {
		values: ReturnType<typeof editorFormValuesOf>;
		isFormValid: boolean;
	};
};

export function useEditorFormAutosave(cv: Cv, onPersisted: (cv: Cv) => void) {
	const { t } = useAppTranslation();
	const withCvSavePending = useWithCvSavePending();
	const prevFormValue = useRef(JSON.stringify(editorFormValuesOf(cv.content)));
	const invalidToastShown = useRef(false);
	const saveChain = useRef(Promise.resolve());

	function saveIfChanged(formApi: SaveFormApi) {
		const values = formApi.state.values;
		const next = JSON.stringify(values);
		if (next === prevFormValue.current) {
			return;
		}

		saveChain.current = saveChain.current
			.catch(() => undefined)
			.then(async () => {
				if (next === prevFormValue.current) {
					return;
				}
				if (!formApi.state.isFormValid) {
					console.error("cv editor save skipped: invalid form");
					if (!invalidToastShown.current) {
						invalidToastShown.current = true;
						toast.add({
							type: "error",
							title: t("cvEditor.save.invalid"),
						});
					}
					prevFormValue.current = next;
					return;
				}
				invalidToastShown.current = false;
				try {
					await withCvSavePending(async () => {
						const saved = await saveCv({
							...cv,
							content: editorContentFromValues(cv.content, values),
						});
						if (saved) {
							onPersisted(saved);
						}
					});
					prevFormValue.current = next;
				} catch (error) {
					console.error(error);
					toast.add({
						type: "error",
						title: t("cvEditor.save.failed"),
					});
				}
			});
	}

	const form = useForm({
		defaultValues: editorFormValuesOf(cv.content),
		validators: {
			onChange: editorFormSchema,
		},
		listeners: {
			onChangeDebounceMs: 1000,
			onChange: ({ formApi }) => {
				saveIfChanged(formApi);
			},
		},
	});

	useUnmount(() => {
		saveIfChanged(form);
	});

	function hydrateFromCv(next: Cv) {
		const values = editorFormValuesOf(next.content);
		prevFormValue.current = JSON.stringify(values);
		form.reset(values);
	}

	return {
		form,
		flush() {
			saveIfChanged(form);
		},
		hydrateFromCv,
	};
}

export type EditorFormApi = ReturnType<typeof useEditorFormAutosave>["form"];
