import { BriefcaseIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";

import type { Cv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import {
	createEmptyExperience,
	type ExperienceEntry,
	experienceDateRangeError,
	experiencesEqual,
	experiencesHaveValidDateRanges,
	experiencesOf,
	withExperiences,
} from "../model/experience-fields";
import { useCvEntryList } from "../model/use-cv-entry-list";
import { MonthInput } from "./month-input";
import { RichTextEditor } from "./rich-text-editor";

type ExperiencesSectionFormProps = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
};

const TEXT_FIELDS = [
	"jobTitle",
	"company",
	"location",
] as const satisfies ReadonlyArray<keyof ExperienceEntry>;

export function ExperiencesSectionForm({
	cv,
	onPersisted,
}: ExperiencesSectionFormProps) {
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
		initial: experiencesOf(cv.content),
		isEqual: experiencesEqual,
		apply: withExperiences,
		canSave: experiencesHaveValidDateRanges,
		createEmpty: createEmptyExperience,
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
							<BriefcaseIcon aria-hidden className="size-4 shrink-0" />
							{t("cvEditor.section.experiences")}
						</CardTitle>
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={handleAdd}
						>
							<PlusIcon data-icon="inline-start" />
							{t("cvEditor.experiences.add")}
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						{entries.length === 0 && (
							<p className="text-muted-foreground text-sm">
								{t("cvEditor.experiences.empty")}
							</p>
						)}
						{entries.map((entry, index) => {
							const dateError = experienceDateRangeError(entry);
							return (
								<div
									key={entry.id}
									className="space-y-3 rounded-lg border border-border p-3"
								>
									<div className="flex flex-wrap items-end justify-between gap-2">
										<Field className="w-auto gap-1.5">
											<FieldLabel htmlFor={`experience-${entry.id}-position`}>
												{t("cvEditor.experiences.position")}
											</FieldLabel>
											<NativeSelect
												id={`experience-${entry.id}-position`}
												size="sm"
												disabled={entries.length < 2}
												value={String(index)}
												aria-label={t("cvEditor.experiences.position")}
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
														{t("cvEditor.experiences.positionOption", {
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
											{t("cvEditor.experiences.delete")}
										</Button>
									</div>

									<FieldGroup className="gap-3">
										{TEXT_FIELDS.map((name) => (
											<Field key={name}>
												<FieldLabel htmlFor={`experience-${entry.id}-${name}`}>
													{t(`cvEditor.experiences.field.${name}`)}
												</FieldLabel>
												<Input
													id={`experience-${entry.id}-${name}`}
													value={entry[name]}
													onBlur={flush}
													onChange={(event) =>
														patchEntry(entry.id, { [name]: event.target.value })
													}
												/>
											</Field>
										))}

										<Field data-invalid={dateError ? true : undefined}>
											<FieldLabel htmlFor={`experience-${entry.id}-startMonth`}>
												{t("cvEditor.experiences.field.startMonth")}
											</FieldLabel>
											<MonthInput
												id={`experience-${entry.id}-startMonth`}
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

										<Field orientation="horizontal">
											<Checkbox
												id={`experience-${entry.id}-isCurrent`}
												checked={entry.isCurrent}
												onBlur={flush}
												onCheckedChange={(checked) => {
													const isCurrent = checked === true;
													patchEntry(entry.id, {
														isCurrent,
														endMonth: isCurrent ? "" : entry.endMonth,
													});
													flush();
												}}
											/>
											<FieldLabel htmlFor={`experience-${entry.id}-isCurrent`}>
												{t("cvEditor.experiences.field.isCurrent")}
											</FieldLabel>
										</Field>

										{!entry.isCurrent && (
											<Field data-invalid={dateError ? true : undefined}>
												<FieldLabel htmlFor={`experience-${entry.id}-endMonth`}>
													{t("cvEditor.experiences.field.endMonth")}
												</FieldLabel>
												<MonthInput
													id={`experience-${entry.id}-endMonth`}
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
												onBlur={flush}
												onChange={(html) =>
													patchEntry(entry.id, { description: html })
												}
											/>
										</Field>
									</FieldGroup>
								</div>
							);
						})}
					</CardContent>
				</Card>
			</form>

			{pendingDelete && (
				<Dialog
					open
					onOpenChange={(open) => {
						if (!open) {
							cancelDelete();
						}
					}}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("cvEditor.experiences.deleteTitle")}</DialogTitle>
							<DialogDescription>
								{t("cvEditor.experiences.deleteDescription", {
									title:
										pendingDelete.jobTitle ||
										pendingDelete.company ||
										t("cvEditor.experiences.untitled"),
								})}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={cancelDelete}>
								<XIcon data-icon="inline-start" />
								{t("cvEditor.experiences.deleteCancel")}
							</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={confirmDelete}
							>
								<Trash2Icon data-icon="inline-start" />
								{t("cvEditor.experiences.deleteConfirm")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
