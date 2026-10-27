import { GraduationCapIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { type Cv, saveCv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { createAutosave } from "@/shared/lib/autosave";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
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
	createEmptyEducation,
	type EducationEntry,
	educationDateRangeError,
	educationEqual,
	educationHaveValidDateRanges,
	educationOf,
	moveEducationTo,
	removeEducation,
	withEducation,
} from "../model/education-fields";

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
	const cvRef = useRef(cv);
	const onPersistedRef = useRef(onPersisted);
	cvRef.current = cv;
	onPersistedRef.current = onPersisted;

	const initial = educationOf(cv.content);
	const [entries, setEntries] = useState(initial);
	const draftRef = useRef(initial);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

	const autosaveRef = useRef(
		createAutosave<EducationEntry[]>({
			initialSaved: initial,
			isEqual: educationEqual,
			save: async (education) => {
				const current = cvRef.current;
				const next = await saveCv({
					...current,
					content: withEducation(current.content, education),
				});
				onPersistedRef.current(next);
			},
		}),
	);

	useEffect(() => {
		const autosave = autosaveRef.current;
		return () => {
			if (educationHaveValidDateRanges(draftRef.current)) {
				void autosave.flush();
			} else {
				autosave.cancel();
			}
		};
	}, []);

	function commit(next: EducationEntry[], options?: { flush?: boolean }) {
		draftRef.current = next;
		setEntries(next);
		if (!educationHaveValidDateRanges(next)) {
			autosaveRef.current.cancel();
			return;
		}
		if (options?.flush) {
			autosaveRef.current.schedule(next);
			void autosaveRef.current.flush();
			return;
		}
		autosaveRef.current.schedule(next);
	}

	function patchEntry(id: string, patch: Partial<EducationEntry>) {
		commit(
			draftRef.current.map((entry) =>
				entry.id === id ? { ...entry, ...patch } : entry,
			),
		);
	}

	function flush() {
		if (!educationHaveValidDateRanges(draftRef.current)) {
			autosaveRef.current.cancel();
			return;
		}
		void autosaveRef.current.flush();
	}

	function handleAdd() {
		commit([...draftRef.current, createEmptyEducation()], { flush: true });
	}

	function handleConfirmDelete() {
		if (!pendingDeleteId) {
			return;
		}
		const id = pendingDeleteId;
		setPendingDeleteId(null);
		commit(removeEducation(draftRef.current, id), { flush: true });
	}

	const pendingDelete = pendingDeleteId
		? draftRef.current.find((entry) => entry.id === pendingDeleteId)
		: undefined;

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
													commit(
														moveEducationTo(
															draftRef.current,
															entry.id,
															toIndex,
														),
														{ flush: true },
													);
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
											onClick={() => setPendingDeleteId(entry.id)}
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
											<Input
												id={`education-${entry.id}-startMonth`}
												type="month"
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
											<Input
												id={`education-${entry.id}-endMonth`}
												type="month"
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
				<Dialog
					open
					onOpenChange={(open) => {
						if (!open) {
							setPendingDeleteId(null);
						}
					}}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("cvEditor.education.deleteTitle")}</DialogTitle>
							<DialogDescription>
								{t("cvEditor.education.deleteDescription", {
									title:
										pendingDelete.school ||
										pendingDelete.degree ||
										t("cvEditor.education.untitled"),
								})}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setPendingDeleteId(null)}
							>
								<XIcon data-icon="inline-start" />
								{t("cvEditor.education.deleteCancel")}
							</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={handleConfirmDelete}
							>
								<Trash2Icon data-icon="inline-start" />
								{t("cvEditor.education.deleteConfirm")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
