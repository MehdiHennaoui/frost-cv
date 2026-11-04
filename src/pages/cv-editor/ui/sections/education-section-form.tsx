import {
	FoldVerticalIcon,
	GraduationCapIcon,
	GripVerticalIcon,
	PlusIcon,
	Trash2Icon,
	UnfoldVerticalIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { useAppTranslation } from "@/shared/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FieldGroup } from "@/shared/ui/field";
import { entryScanLabel } from "../../model/entries/entry-scan-label";
import { useEntryCollapse } from "../../model/entries/use-entry-collapse";
import { useExpandEntryForHash } from "../../model/entries/use-expand-entry-for-hash";
import {
	useEditorForm,
	useEditorValues,
} from "../../model/form/editor-form-context";
import { useLocationHash } from "../../model/nav/use-location-hash";
import { createEmptyEducation } from "../../model/sections/education-fields";
import { EditorBoundField } from "../editors/editor-bound-field";
import { CollapsibleEntryChrome } from "../entries/collapsible-entry-chrome";
import { CvDeleteConfirmDialog } from "../entries/cv-delete-confirm-dialog";
import { PositionMenu } from "../entries/position-menu";
import { ReorderList } from "../entries/reorder-list";
import { IconTooltipButton } from "../shell/icon-tooltip-button";

type EducationSectionFormProps = {
	reorder?: ReactNode;
};

const TEXT_FIELDS = ["school", "degree", "location"] as const;

export function EducationSectionForm({ reorder }: EducationSectionFormProps) {
	const { t } = useAppTranslation();
	const { form, schedule } = useEditorForm();
	const entries = useEditorValues().education;
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
	const { isExpanded, toggle, expand, toggleAll } = useEntryCollapse();
	const hash = useLocationHash();
	useExpandEntryForHash(
		hash,
		(id) => entries.some((entry) => entry.id === id),
		expand,
	);
	const sectionName = t("cvEditor.section.education");
	const anyExpanded = entries.some((entry) => isExpanded(entry.id));
	const entryToDelete = deleteTargetId
		? entries.find((entry) => entry.id === deleteTargetId)
		: undefined;

	return (
		<>
			<form.Field name="education" mode="array">
				{(field) => (
					<Card id="education" size="sm">
						<CardHeader className="flex flex-row items-center justify-between gap-2">
							<CardTitle className="flex min-w-0 items-center gap-2">
								<GraduationCapIcon aria-hidden className="size-4 shrink-0" />
								{t("cvEditor.section.education")}
							</CardTitle>
							<div className="flex shrink-0 items-center gap-1">
								<IconTooltipButton
									label={t("cvEditor.education.add")}
									onClick={() => {
										field.pushValue(createEmptyEducation());
										schedule();
									}}
								>
									<PlusIcon />
								</IconTooltipButton>
								<IconTooltipButton
									label={
										anyExpanded
											? t("cvEditor.entry.collapseAll")
											: t("cvEditor.entry.expandAll")
									}
									onClick={() => toggleAll(entries.map((entry) => entry.id))}
								>
									{anyExpanded ? <FoldVerticalIcon /> : <UnfoldVerticalIcon />}
								</IconTooltipButton>
								{reorder}
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{entries.length === 0 && (
								<p className="text-muted-foreground text-sm">
									{t("cvEditor.education.empty")}
								</p>
							)}
							{entries.length > 0 && (
								<ReorderList
									items={entries}
									onMove={(id, toIndex) => {
										const fromIndex = entries.findIndex(
											(entry) => entry.id === id,
										);
										if (fromIndex < 0 || fromIndex === toIndex) {
											return;
										}
										field.moveValue(fromIndex, toIndex);
										schedule();
									}}
									renderItem={(entry, index, drag) => (
										<CollapsibleEntryChrome
											id={entry.id}
											expanded={isExpanded(entry.id)}
											onToggle={() => toggle(entry.id)}
											scanLabel={entryScanLabel(
												index + 1,
												[entry.school, entry.degree],
												sectionName,
											)}
											expandLabel={t("cvEditor.entry.expand")}
											collapseLabel={t("cvEditor.entry.collapse")}
											actions={
												<>
													<IconTooltipButton
														label={t("cvEditor.education.delete")}
														onClick={() => setDeleteTargetId(entry.id)}
													>
														<Trash2Icon />
													</IconTooltipButton>
													<PositionMenu
														label={t("cvEditor.education.position")}
														index={index}
														count={entries.length}
														onMove={(toIndex) => {
															const fromIndex = entries.findIndex(
																(item) => item.id === entry.id,
															);
															if (fromIndex < 0 || fromIndex === toIndex) {
																return;
															}
															field.moveValue(fromIndex, toIndex);
															schedule();
														}}
														optionLabel={(position) =>
															t("cvEditor.education.positionOption", {
																n: position + 1,
															})
														}
													/>
													<IconTooltipButton
														label={t("cvEditor.education.drag")}
														{...drag.attributes}
														{...drag.listeners}
													>
														<GripVerticalIcon />
													</IconTooltipButton>
												</>
											}
										>
											<FieldGroup className="gap-3">
												{TEXT_FIELDS.map((name) => (
													<EditorBoundField
														key={name}
														name={`education[${index}].${name}`}
														id={`education-${entry.id}-${name}`}
														label={t(`cvEditor.education.field.${name}`)}
													/>
												))}
												<EditorBoundField
													name={`education[${index}].startMonth`}
													id={`education-${entry.id}-startMonth`}
													label={t("cvEditor.education.field.startMonth")}
													control="month"
												/>
												<EditorBoundField
													name={`education[${index}].endMonth`}
													id={`education-${entry.id}-endMonth`}
													label={t("cvEditor.education.field.endMonth")}
													control="month"
												/>
											</FieldGroup>
										</CollapsibleEntryChrome>
									)}
								/>
							)}
						</CardContent>
					</Card>
				)}
			</form.Field>
			{entryToDelete && (
				<CvDeleteConfirmDialog
					title={t("cvEditor.education.deleteTitle")}
					description={t("cvEditor.education.deleteDescription", {
						title:
							entryToDelete.school ||
							entryToDelete.degree ||
							t("cvEditor.education.untitled"),
					})}
					cancelLabel={t("cvEditor.education.deleteCancel")}
					confirmLabel={t("cvEditor.education.deleteConfirm")}
					onCancel={() => setDeleteTargetId(null)}
					onConfirm={() => {
						const index = form.state.values.education.findIndex(
							(entry) => entry.id === entryToDelete.id,
						);
						setDeleteTargetId(null);
						if (index < 0) {
							return;
						}
						void form.removeFieldValue("education", index).then(() => {
							schedule();
						});
					}}
				/>
			)}
		</>
	);
}
