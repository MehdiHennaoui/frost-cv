import {
	FoldVerticalIcon,
	GraduationCapIcon,
	GripVerticalIcon,
	PlusIcon,
	Trash2Icon,
	UnfoldVerticalIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import type { Cv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { entryScanLabel } from "../../model/entries/entry-scan-label";
import { useCvEntryList } from "../../model/entries/use-cv-entry-list";
import { useEntryCollapse } from "../../model/entries/use-entry-collapse";
import { useExpandEntryForHash } from "../../model/entries/use-expand-entry-for-hash";
import { useLocationHash } from "../../model/nav/use-location-hash";
import { flushOnFormLeave } from "../../model/save/use-cv-autosave";
import {
	createEmptyEducation,
	type EducationEntry,
	educationDateRangeError,
	educationEqual,
	educationHaveValidDateRanges,
	educationOf,
	withEducation,
} from "../../model/sections/education-fields";
import { MonthInput } from "../editors/month-input";
import { CollapsibleEntryChrome } from "../entries/collapsible-entry-chrome";
import { CvDeleteConfirmDialog } from "../entries/cv-delete-confirm-dialog";
import { PositionMenu } from "../entries/position-menu";
import { ReorderList } from "../entries/reorder-list";
import { IconTooltipButton } from "../shell/icon-tooltip-button";

type EducationSectionFormProps = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
	reorder?: ReactNode;
};

const TEXT_FIELDS = [
	"school",
	"degree",
	"location",
] as const satisfies ReadonlyArray<keyof EducationEntry>;

export function EducationSectionForm({
	cv,
	onPersisted,
	reorder,
}: EducationSectionFormProps) {
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
		initial: educationOf(cv.content),
		isEqual: educationEqual,
		apply: withEducation,
		canSave: educationHaveValidDateRanges,
		createEmpty: createEmptyEducation,
	});
	const { isExpanded, toggle, expand, toggleAll } = useEntryCollapse();
	const hash = useLocationHash();
	useExpandEntryForHash(
		hash,
		(id) => entries.some((entry) => entry.id === id),
		expand,
	);
	const sectionName = t("cvEditor.section.education");
	const anyExpanded = entries.some((entry) => isExpanded(entry.id));

	return (
		<>
			<form
				onSubmit={(event) => {
					event.preventDefault();
				}}
			>
				<Card id="education" size="sm">
					<CardHeader className="flex flex-row items-center justify-between gap-2">
						<CardTitle className="flex min-w-0 items-center gap-2">
							<GraduationCapIcon aria-hidden className="size-4 shrink-0" />
							{t("cvEditor.section.education")}
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
								label={t("cvEditor.education.add")}
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
								{t("cvEditor.education.empty")}
							</p>
						)}
						{entries.length > 0 && (
							<ReorderList
								items={entries}
								onMove={moveEntry}
								renderItem={(entry, index, drag) => {
									const dateError = educationDateRangeError(entry);
									const expanded = isExpanded(entry.id);
									return (
										<CollapsibleEntryChrome
											id={entry.id}
											expanded={expanded}
											onToggle={() => toggle(entry.id)}
											scanLabel={entryScanLabel(
												index + 1,
												[entry.degree, entry.school],
												sectionName,
											)}
											expandLabel={t("cvEditor.entry.expand")}
											collapseLabel={t("cvEditor.entry.collapse")}
											actions={
												<>
													<IconTooltipButton
														label={t("cvEditor.education.delete")}
														onClick={() => requestDelete(entry.id)}
													>
														<Trash2Icon />
													</IconTooltipButton>
													<PositionMenu
														label={t("cvEditor.education.position")}
														index={index}
														count={entries.length}
														onMove={(toIndex) => moveEntry(entry.id, toIndex)}
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
													<Field key={name}>
														<FieldLabel
															htmlFor={`education-${entry.id}-${name}`}
														>
															{t(`cvEditor.education.field.${name}`)}
														</FieldLabel>
														<Input
															id={`education-${entry.id}-${name}`}
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
														htmlFor={`education-${entry.id}-startMonth`}
													>
														{t("cvEditor.education.field.startMonth")}
													</FieldLabel>
													<MonthInput
														id={`education-${entry.id}-startMonth`}
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

												<Field data-invalid={dateError ? true : undefined}>
													<FieldLabel
														htmlFor={`education-${entry.id}-endMonth`}
													>
														{t("cvEditor.education.field.endMonth")}
													</FieldLabel>
													<MonthInput
														id={`education-${entry.id}-endMonth`}
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
														<FieldError errors={[{ message: t(dateError) }]} />
													)}
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
					title={t("cvEditor.education.deleteTitle")}
					description={t("cvEditor.education.deleteDescription", {
						title:
							entryToDelete.school ||
							entryToDelete.degree ||
							t("cvEditor.education.untitled"),
					})}
					cancelLabel={t("cvEditor.education.deleteCancel")}
					confirmLabel={t("cvEditor.education.deleteConfirm")}
					onCancel={cancelDelete}
					onConfirm={confirmDelete}
				/>
			)}
		</>
	);
}
