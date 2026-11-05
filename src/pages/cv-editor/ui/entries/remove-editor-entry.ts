import type { EditorFormValues } from "../../model/form/editor-form-values";
import type { EditorFormApi } from "../../model/form/use-editor-form-autosave";

type EntryListKey = {
	[K in keyof EditorFormValues]: EditorFormValues[K] extends { id: string }[]
		? K
		: never;
}[keyof EditorFormValues];

export function removeEditorEntry(
	form: EditorFormApi,
	listKey: EntryListKey,
	entryId: string,
	afterRemove?: () => void,
) {
	const list = form.state.values[listKey];
	const index = list.findIndex((item) => item.id === entryId);
	if (index < 0) {
		return;
	}
	void form.removeFieldValue(listKey, index).then(() => {
		afterRemove?.();
	});
}
