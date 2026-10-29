import { GraduationCapIcon, PlusIcon, Trash2Icon } from "lucide-react";

import type { Cv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import {
	createEmptyEducation,
	type EducationEntry,
	educationDateRangeError,
	educationEqual,
	educationHaveValidDateRanges,
	educationOf,
	withEducation,
} from "../model/education-fields";
import { useCvEntryList } from "../model/use-cv-entry-list";
import { CvDeleteConfirmDialog } from "./cv-delete-confirm-dialog";
import { MonthInput } from "./month-input";

type EducationSectionFormProps = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
};

const TEXT_FIELDS = [
	"school",
	"degree",
	"location",
] as const satisfies ReadonlyArray<keyof EducationEntry>;

export function EducationSectionForm({
	cv,
	onPersisted,
}: EducationSectionFormProps) {
	const { t } = useAppTranslation();
	const {
		entries,
		pendingDelete,
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
						<CardTitle className="flex items-center gap-2">
							<GraduationCapIcon aria-hidden className="size-4 shrink-0" />
							{t("cvEditor.section.education")}
						</CardTitle>
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={handleAdd}
						>
							<PlusIcon data-icon="inline-start" />
							{t("cvEditor.education.add")}
						</Button>
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
									<div className="flex flex-wrap items-end justify-between gap-2">
										<Field className="w-auto gap-1.5">
											<FieldLabel htmlFor={`education-${entry.id}-position`}>
												{t("cvEditor.education.position")}
											</FieldLabel>
											<NativeSelect
												id={`education-${entry.id}-position`}
												size="sm"
												disabled={entries.length < 2}
												value={String(index)}
												aria-label={t("cvEditor.education.position")}
												onChange={(event) => {
													const toIndex = Number(event.target.value);
													if (Number.isNaN(toIndex)) {
														return;
													}
													moveEntry(entry.id, toIndex);
												}}
											>
												{Array.from({ length: entries.length }, (_, position) =>
													String(position),
												).map((value) => (
													<NativeSelectOption key={value} value={value}>
														{t("cvEditor.education.positionOption", {
															n: Number(value) + 1,
														})}
													</NativeSelectOption>
												))}
											</NativeSelect>
										</Field>
										<Button
											type="button"
											size="sm"
											variant="ghost"
											onClick={() => requestDelete(entry.id)}
										>
											<Trash2Icon data-icon="inline-start" />
											{t("cvEditor.education.delete")}
										</Button>
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
													onBlur={flush}
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
												onBlur={flush}
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
												onBlur={flush}
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

			{pendingDelete && (
				<CvDeleteConfirmDialog
					title={t("cvEditor.education.deleteTitle")}
					description={t("cvEditor.education.deleteDescription", {
						title:
							pendingDelete.school ||
							pendingDelete.degree ||
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
