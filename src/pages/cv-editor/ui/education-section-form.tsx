import { GraduationCapIcon, PlusIcon, Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";

import type { Cv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
	createEmptyEducation,
	type EducationEntry,
	educationDateRangeError,
	educationEqual,
	educationHaveValidDateRanges,
	educationOf,
	withEducation,
} from "../model/education-fields";
import { flushOnFormLeave } from "../model/use-cv-autosave";
import { useCvEntryList } from "../model/use-cv-entry-list";
import { CvDeleteConfirmDialog } from "./cv-delete-confirm-dialog";
import { IconTooltipButton } from "./icon-tooltip-button";
import { MonthInput } from "./month-input";
import { PositionMenu } from "./position-menu";

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
							<GraduationCapIcon aria-hidden className="size-4 shrink-0" />
							{t("cvEditor.section.education")}
						</CardTitle>
						<div className="flex shrink-0 items-center gap-1">
							{reorder}
							<IconTooltipButton
								label={t("cvEditor.education.add")}
								onClick={handleAdd}
							>
								<PlusIcon />
							</IconTooltipButton>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{entries.length === 0 && (
							<p className="text-muted-foreground text-sm">
								{t("cvEditor.education.empty")}
							</p>
						)}
						{entries.map((entry, index) => {
							const dateError = educationDateRangeError(entry);
							return (
								<div
									key={entry.id}
									className="space-y-3 rounded-lg border border-border p-3"
								>
									<div className="flex flex-wrap items-center justify-between gap-2">
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
											label={t("cvEditor.education.delete")}
											onClick={() => requestDelete(entry.id)}
										>
											<Trash2Icon />
										</IconTooltipButton>
									</div>

									<FieldGroup className="gap-3">
										{TEXT_FIELDS.map((name) => (
											<Field key={name}>
												<FieldLabel htmlFor={`education-${entry.id}-${name}`}>
													{t(`cvEditor.education.field.${name}`)}
												</FieldLabel>
												<Input
													id={`education-${entry.id}-${name}`}
													value={entry[name]}
													onBlur={(event) => flushOnFormLeave(event, flush)}
													onChange={(event) =>
														patchEntry(entry.id, { [name]: event.target.value })
													}
												/>
											</Field>
										))}

										<Field data-invalid={dateError ? true : undefined}>
											<FieldLabel htmlFor={`education-${entry.id}-startMonth`}>
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
											<FieldLabel htmlFor={`education-${entry.id}-endMonth`}>
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
								</div>
							);
						})}
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
