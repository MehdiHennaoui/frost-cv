import {
	BriefcaseIcon,
	FoldVerticalIcon,
	GripVerticalIcon,
	PlusIcon,
	Trash2Icon,
	UnfoldVerticalIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import type { Cv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { entryScanLabel } from "../model/entry-scan-label";
import {
	createEmptyExperience,
	type ExperienceEntry,
	experienceDateRangeError,
	experiencesEqual,
	experiencesHaveValidDateRanges,
	experiencesOf,
	withExperiences,
} from "../model/experience-fields";
import { flushOnFormLeave } from "../model/use-cv-autosave";
import { useCvEntryList } from "../model/use-cv-entry-list";
import { useEntryCollapse } from "../model/use-entry-collapse";
import { CollapsibleEntryChrome } from "./collapsible-entry-chrome";
import { CvDeleteConfirmDialog } from "./cv-delete-confirm-dialog";
import { IconTooltipButton } from "./icon-tooltip-button";
import { MonthInput } from "./month-input";
import { PositionMenu } from "./position-menu";
import { ReorderList } from "./reorder-list";
import { RichTextEditor } from "./rich-text-editor";

type ExperiencesSectionFormProps = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
	reorder?: ReactNode;
};

const TEXT_FIELDS = [
	"jobTitle",
	"company",
	"location",
] as const satisfies ReadonlyArray<keyof ExperienceEntry>;

export function ExperiencesSectionForm({
	cv,
	onPersisted,
	reorder,
}: ExperiencesSectionFormProps) {
	const { t } = useAppTranslation();
	const {
		entries,
		entryToDelete,
		patchEntry,
		flush,
		handleAdd,
		moveEntry,
		requestDelete,
		cancelDelete,
		confirmDelete,
	} = useCvEntryList({
		cv,
		onPersisted,
		initial: experiencesOf(cv.content),
		isEqual: experiencesEqual,
		apply: withExperiences,
		canSave: experiencesHaveValidDateRanges,
		createEmpty: createEmptyExperience,
	});
	const { isExpanded, toggle, toggleAll } = useEntryCollapse();
	const sectionName = t("cvEditor.section.experiences");
	const anyExpanded = entries.some((entry) => isExpanded(entry.id));

	return (
		<>
			<form
				onSubmit={(event) => {
					event.preventDefault();
				}}
			>
				<Card size="sm">
					<CardHeader className="flex flex-row items-center justify-between gap-2">
						<CardTitle className="flex min-w-0 items-center gap-2">
							<BriefcaseIcon aria-hidden className="size-4 shrink-0" />
							{t("cvEditor.section.experiences")}
						</CardTitle>
						<div className="flex shrink-0 items-center gap-1">
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
							<IconTooltipButton
								label={t("cvEditor.experiences.add")}
								onClick={handleAdd}
							>
								<PlusIcon />
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
								onMove={moveEntry}
								renderItem={(entry, index, drag) => {
									const dateError = experienceDateRangeError(entry);
									const expanded = isExpanded(entry.id);
									return (
										<CollapsibleEntryChrome
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
														onClick={() => requestDelete(entry.id)}
													>
														<Trash2Icon />
													</IconTooltipButton>
													<PositionMenu
														label={t("cvEditor.experiences.position")}
														index={index}
														count={entries.length}
														onMove={(toIndex) => moveEntry(entry.id, toIndex)}
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
													<Field key={name}>
														<FieldLabel
															htmlFor={`experience-${entry.id}-${name}`}
														>
															{t(`cvEditor.experiences.field.${name}`)}
														</FieldLabel>
														<Input
															id={`experience-${entry.id}-${name}`}
															value={entry[name]}
															onBlur={(event) => flushOnFormLeave(event, flush)}
															onChange={(event) =>
																patchEntry(entry.id, {
																	[name]: event.target.value,
																})
															}
														/>
													</Field>
												))}

												<Field data-invalid={dateError ? true : undefined}>
													<FieldLabel
														htmlFor={`experience-${entry.id}-startMonth`}
													>
														{t("cvEditor.experiences.field.startMonth")}
													</FieldLabel>
													<MonthInput
														id={`experience-${entry.id}-startMonth`}
														value={entry.startMonth}
														aria-invalid={dateError ? true : undefined}
														onBlur={(event) => flushOnFormLeave(event, flush)}
														onChange={(event) =>
															patchEntry(entry.id, {
																startMonth: event.target.value,
															})
														}
													/>
													{dateError && (
														<FieldError errors={[{ message: t(dateError) }]} />
													)}
												</Field>

												<Field orientation="horizontal">
													<Checkbox
														id={`experience-${entry.id}-isCurrent`}
														checked={entry.isCurrent}
														onBlur={(event) => flushOnFormLeave(event, flush)}
														onCheckedChange={(checked) => {
															const isCurrent = checked === true;
															patchEntry(entry.id, {
																isCurrent,
																endMonth: isCurrent ? "" : entry.endMonth,
															});
															flush();
														}}
													/>
													<FieldLabel
														htmlFor={`experience-${entry.id}-isCurrent`}
													>
														{t("cvEditor.experiences.field.isCurrent")}
													</FieldLabel>
												</Field>

												{!entry.isCurrent && (
													<Field data-invalid={dateError ? true : undefined}>
														<FieldLabel
															htmlFor={`experience-${entry.id}-endMonth`}
														>
															{t("cvEditor.experiences.field.endMonth")}
														</FieldLabel>
														<MonthInput
															id={`experience-${entry.id}-endMonth`}
															value={entry.endMonth}
															aria-invalid={dateError ? true : undefined}
															onBlur={(event) => flushOnFormLeave(event, flush)}
															onChange={(event) =>
																patchEntry(entry.id, {
																	endMonth: event.target.value,
																})
															}
														/>
														{dateError && (
															<FieldError
																errors={[{ message: t(dateError) }]}
															/>
														)}
													</Field>
												)}

												<Field>
													<FieldLabel
														htmlFor={`experience-${entry.id}-description`}
													>
														{t("cvEditor.experiences.field.description")}
													</FieldLabel>
													<RichTextEditor
														id={`experience-${entry.id}-description`}
														value={entry.description}
														onBlur={() => flushOnFormLeave(undefined, flush)}
														onChange={(html) =>
															patchEntry(entry.id, { description: html })
														}
													/>
												</Field>
											</FieldGroup>
										</CollapsibleEntryChrome>
									);
								}}
							/>
						)}
					</CardContent>
				</Card>
			</form>

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
					onCancel={cancelDelete}
					onConfirm={confirmDelete}
				/>
			)}
		</>
	);
}
