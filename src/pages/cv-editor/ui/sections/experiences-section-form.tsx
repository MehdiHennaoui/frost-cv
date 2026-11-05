import {
	BriefcaseIcon,
	FoldVerticalIcon,
	GripVerticalIcon,
	PlusIcon,
	Trash2Icon,
	UnfoldVerticalIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { useAppTranslation } from "@/shared/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { entryScanLabel } from "../../model/entries/entry-scan-label";
import { useEntryCollapse } from "../../model/entries/use-entry-collapse";
import { useExpandEntryForHash } from "../../model/entries/use-expand-entry-for-hash";
import {
	useEditorForm,
	useEditorValues,
} from "../../model/form/editor-form-context";
import { useLocationHash } from "../../model/nav/use-location-hash";
import { createEmptyExperience } from "../../model/sections/experience-fields";
import { EditorBoundField } from "../editors/editor-bound-field";
import { CollapsibleEntryChrome } from "../entries/collapsible-entry-chrome";
import { CvDeleteConfirmDialog } from "../entries/cv-delete-confirm-dialog";
import { PositionMenu } from "../entries/position-menu";
import { ReorderList } from "../entries/reorder-list";
import { IconTooltipButton } from "../shell/icon-tooltip-button";

type ExperiencesSectionFormProps = {
	reorder?: ReactNode;
};

const TEXT_FIELDS = ["jobTitle", "company", "location"] as const;

export function ExperiencesSectionForm({
	reorder,
}: ExperiencesSectionFormProps) {
	const { t } = useAppTranslation();
	const form = useEditorForm();
	const entries = useEditorValues().experiences;
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
	const { isExpanded, toggle, expand, toggleAll } = useEntryCollapse();
	const hash = useLocationHash();
	useExpandEntryForHash(
		hash,
		(id) => entries.some((entry) => entry.id === id),
		expand,
	);
	const sectionName = t("cvEditor.section.experiences");
	const anyExpanded = entries.some((entry) => isExpanded(entry.id));
	const entryToDelete = deleteTargetId
		? entries.find((entry) => entry.id === deleteTargetId)
		: undefined;

	return (
		<>
			<form.Field name="experiences" mode="array">
				{(field) => (
					<Card id="experiences" size="sm">
						<CardHeader className="flex flex-row items-center justify-between gap-2">
							<CardTitle className="flex min-w-0 items-center gap-2">
								<BriefcaseIcon aria-hidden className="size-4 shrink-0" />
								{t("cvEditor.section.experiences")}
							</CardTitle>
							<div className="flex shrink-0 items-center gap-1">
								<IconTooltipButton
									label={t("cvEditor.experiences.add")}
									onClick={() => {
										field.pushValue(createEmptyExperience());
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
									{t("cvEditor.experiences.empty")}
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
									}}
									renderItem={(entry, index, drag) => {
										const expanded = isExpanded(entry.id);
										return (
											<CollapsibleEntryChrome
												id={entry.id}
												expanded={expanded}
												onToggle={() => toggle(entry.id)}
												scanLabel={entryScanLabel(
													index + 1,
													[entry.jobTitle, entry.company],
													sectionName,
												)}
												expandLabel={t("cvEditor.entry.expand")}
												collapseLabel={t("cvEditor.entry.collapse")}
												actions={
													<>
														<IconTooltipButton
															label={t("cvEditor.experiences.delete")}
															onClick={() => setDeleteTargetId(entry.id)}
														>
															<Trash2Icon />
														</IconTooltipButton>
														<PositionMenu
															label={t("cvEditor.experiences.position")}
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
															}}
															optionLabel={(position) =>
																t("cvEditor.experiences.positionOption", {
																	n: position + 1,
																})
															}
														/>
														<IconTooltipButton
															label={t("cvEditor.experiences.drag")}
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
															name={`experiences[${index}].${name}`}
															id={`experience-${entry.id}-${name}`}
															label={t(`cvEditor.experiences.field.${name}`)}
														/>
													))}
													<EditorBoundField
														name={`experiences[${index}].startMonth`}
														id={`experience-${entry.id}-startMonth`}
														label={t("cvEditor.experiences.field.startMonth")}
														control="month"
													/>
													<Field orientation="horizontal">
														<Checkbox
															id={`experience-${entry.id}-isCurrent`}
															checked={entry.isCurrent}
															onCheckedChange={(checked) => {
																const isCurrent = checked === true;
																field.replaceValue(index, {
																	...entry,
																	isCurrent,
																	endMonth: isCurrent ? "" : entry.endMonth,
																});
															}}
														/>
														<FieldLabel
															htmlFor={`experience-${entry.id}-isCurrent`}
														>
															{t("cvEditor.experiences.field.isCurrent")}
														</FieldLabel>
													</Field>
													{!entry.isCurrent && (
														<EditorBoundField
															name={`experiences[${index}].endMonth`}
															id={`experience-${entry.id}-endMonth`}
															label={t("cvEditor.experiences.field.endMonth")}
															control="month"
														/>
													)}
													<EditorBoundField
														name={`experiences[${index}].description`}
														id={`experience-${entry.id}-description`}
														label={t("cvEditor.experiences.field.description")}
														control="richtext"
													/>
												</FieldGroup>
											</CollapsibleEntryChrome>
										);
									}}
								/>
							)}
						</CardContent>
					</Card>
				)}
			</form.Field>
			{entryToDelete && (
				<CvDeleteConfirmDialog
					title={t("cvEditor.experiences.deleteTitle")}
					description={t("cvEditor.experiences.deleteDescription", {
						title:
							entryToDelete.jobTitle ||
							entryToDelete.company ||
							t("cvEditor.experiences.untitled"),
					})}
					cancelLabel={t("cvEditor.experiences.deleteCancel")}
					confirmLabel={t("cvEditor.experiences.deleteConfirm")}
					onCancel={() => setDeleteTargetId(null)}
					onConfirm={() => {
						const index = form.state.values.experiences.findIndex(
							(entry) => entry.id === entryToDelete.id,
						);
						setDeleteTargetId(null);
						if (index < 0) {
							return;
						}
						void form.removeFieldValue("experiences", index);
					}}
				/>
			)}
		</>
	);
}
