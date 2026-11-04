import {
	FoldVerticalIcon,
	GripVerticalIcon,
	LanguagesIcon,
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
import { createEmptyLanguage } from "../../model/sections/language-fields";
import { EditorBoundField } from "../editors/editor-bound-field";
import { CollapsibleEntryChrome } from "../entries/collapsible-entry-chrome";
import { CvDeleteConfirmDialog } from "../entries/cv-delete-confirm-dialog";
import { PositionMenu } from "../entries/position-menu";
import { ReorderList } from "../entries/reorder-list";
import { IconTooltipButton } from "../shell/icon-tooltip-button";

type LanguagesSectionFormProps = {
	reorder?: ReactNode;
};

const TEXT_FIELDS = ["language", "level"] as const;

export function LanguagesSectionForm({ reorder }: LanguagesSectionFormProps) {
	const { t } = useAppTranslation();
	const { form, flush } = useEditorForm();
	const entries = useEditorValues().languages;
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
	const { isExpanded, toggle, expand, toggleAll } = useEntryCollapse();
	const hash = useLocationHash();
	useExpandEntryForHash(
		hash,
		(id) => entries.some((entry) => entry.id === id),
		expand,
	);
	const sectionName = t("cvEditor.section.languages");
	const anyExpanded = entries.some((entry) => isExpanded(entry.id));
	const entryToDelete = deleteTargetId
		? entries.find((entry) => entry.id === deleteTargetId)
		: undefined;

	return (
		<>
			<form.Field name="languages" mode="array">
				{(field) => (
					<Card id="languages" size="sm">
						<CardHeader className="flex flex-row items-center justify-between gap-2">
							<CardTitle className="flex min-w-0 items-center gap-2">
								<LanguagesIcon aria-hidden className="size-4 shrink-0" />
								{t("cvEditor.section.languages")}
							</CardTitle>
							<div className="flex shrink-0 items-center gap-1">
								<IconTooltipButton
									label={t("cvEditor.languages.add")}
									onClick={() => {
										field.pushValue(createEmptyLanguage());
										flush();
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
									{t("cvEditor.languages.empty")}
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
										flush();
									}}
									renderItem={(entry, index, drag) => (
										<CollapsibleEntryChrome
											id={entry.id}
											expanded={isExpanded(entry.id)}
											onToggle={() => toggle(entry.id)}
											scanLabel={entryScanLabel(
												index + 1,
												[entry.language],
												sectionName,
											)}
											expandLabel={t("cvEditor.entry.expand")}
											collapseLabel={t("cvEditor.entry.collapse")}
											actions={
												<>
													<IconTooltipButton
														label={t("cvEditor.languages.delete")}
														onClick={() => setDeleteTargetId(entry.id)}
													>
														<Trash2Icon />
													</IconTooltipButton>
													<PositionMenu
														label={t("cvEditor.languages.position")}
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
															flush();
														}}
														optionLabel={(position) =>
															t("cvEditor.languages.positionOption", {
																n: position + 1,
															})
														}
													/>
													<IconTooltipButton
														label={t("cvEditor.languages.drag")}
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
														name={`languages[${index}].${name}`}
														id={`language-${entry.id}-${name}`}
														label={t(`cvEditor.languages.field.${name}`)}
													/>
												))}
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
					title={t("cvEditor.languages.deleteTitle")}
					description={t("cvEditor.languages.deleteDescription", {
						title:
							entryToDelete.language ||
							entryToDelete.level ||
							t("cvEditor.languages.untitled"),
					})}
					cancelLabel={t("cvEditor.languages.deleteCancel")}
					confirmLabel={t("cvEditor.languages.deleteConfirm")}
					onCancel={() => setDeleteTargetId(null)}
					onConfirm={() => {
						const index = form.state.values.languages.findIndex(
							(entry) => entry.id === entryToDelete.id,
						);
						setDeleteTargetId(null);
						if (index < 0) {
							return;
						}
						void form.removeFieldValue("languages", index).then(() => {
							flush();
						});
					}}
				/>
			)}
		</>
	);
}
