import { LayoutListIcon, Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";

import { customSectionKey } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FieldGroup } from "@/shared/ui/field";
import {
	useEditorForm,
	useEditorValues,
} from "../../model/form/editor-form-context";
import { EditorBoundField } from "../editors/editor-bound-field";
import { useEntryDeleteConfirm } from "../entries/entry-delete-confirm-context";
import { removeEditorEntry } from "../entries/remove-editor-entry";
import { IconTooltipButton } from "../shell/icon-tooltip-button";

type CustomSectionFormProps = {
	sectionId: string;
	reorder?: ReactNode;
};

export function CustomSectionForm({
	sectionId,
	reorder,
}: CustomSectionFormProps) {
	const { t } = useAppTranslation();
	const form = useEditorForm();
	const { requestEntryDelete } = useEntryDeleteConfirm();
	const sections = useEditorValues().customSections;
	const index = sections.findIndex((section) => section.id === sectionId);
	const section = index >= 0 ? sections[index] : undefined;
	const heading = section?.title.trim() || t("cvEditor.customs.untitled");

	if (!section) {
		return null;
	}

	return (
		<Card id={sectionId} size="sm">
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle className="flex min-w-0 items-center gap-2">
					<LayoutListIcon aria-hidden className="size-4 shrink-0" />
					<span className="truncate">{heading}</span>
				</CardTitle>
				<div className="flex shrink-0 items-center gap-1">
					<IconTooltipButton
						label={t("cvEditor.customs.delete")}
						onClick={() => {
							requestEntryDelete({
								title: t("cvEditor.customs.deleteTitle"),
								description: t("cvEditor.customs.deleteDescription", {
									title: heading,
								}),
								cancelLabel: t("cvEditor.customs.deleteCancel"),
								confirmLabel: t("cvEditor.customs.deleteConfirm"),
								onConfirm: () => {
									removeEditorEntry(form, "customSections", sectionId, () => {
										form.setFieldValue(
											"sectionOrder",
											form.state.values.sectionOrder.filter(
												(key) => key !== customSectionKey(sectionId),
											),
										);
									});
								},
							});
						}}
					>
						<Trash2Icon />
					</IconTooltipButton>
					{reorder}
				</div>
			</CardHeader>
			<CardContent>
				<FieldGroup className="gap-3">
					<EditorBoundField
						name={`customSections[${index}].title`}
						id={`custom-${sectionId}-title`}
						label={t("cvEditor.customs.field.title")}
					/>
					<EditorBoundField
						name={`customSections[${index}].description`}
						id={`custom-${sectionId}-description`}
						label={t("cvEditor.customs.field.description")}
						control="richtext"
					/>
				</FieldGroup>
			</CardContent>
		</Card>
	);
}
