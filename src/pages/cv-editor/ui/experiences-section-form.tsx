import {
	ArrowDownIcon,
	ArrowUpIcon,
	BriefcaseIcon,
	PlusIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { type Cv, saveCv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { createAutosave } from "@/shared/lib/autosave";
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
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
	createEmptyExperience,
	type ExperienceEntry,
	experiencesEqual,
	experiencesOf,
	moveExperience,
	removeExperience,
	withExperiences,
} from "../model/experience-fields";
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
	const cvRef = useRef(cv);
	const onPersistedRef = useRef(onPersisted);
	cvRef.current = cv;
	onPersistedRef.current = onPersisted;

	const initial = experiencesOf(cv.content);
	const [entries, setEntries] = useState(initial);
	const draftRef = useRef(initial);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

	const autosaveRef = useRef(
		createAutosave<ExperienceEntry[]>({
			initialSaved: initial,
			isEqual: experiencesEqual,
			save: async (experiences) => {
				const current = cvRef.current;
				const next = await saveCv({
					...current,
					content: withExperiences(current.content, experiences),
				});
				onPersistedRef.current(next);
			},
		}),
	);

	useEffect(() => {
		const autosave = autosaveRef.current;
		return () => {
			void autosave.flush();
		};
	}, []);

	function commit(next: ExperienceEntry[], options?: { flush?: boolean }) {
		draftRef.current = next;
		setEntries(next);
		if (options?.flush) {
			autosaveRef.current.schedule(next);
			void autosaveRef.current.flush();
			return;
		}
		autosaveRef.current.schedule(next);
	}

	function patchEntry(id: string, patch: Partial<ExperienceEntry>) {
		commit(
			draftRef.current.map((entry) =>
				entry.id === id ? { ...entry, ...patch } : entry,
			),
		);
	}

	function flush() {
		void autosaveRef.current.flush();
	}

	function handleAdd() {
		commit([...draftRef.current, createEmptyExperience()], { flush: true });
	}

	function handleConfirmDelete() {
		if (!pendingDeleteId) {
			return;
		}
		const id = pendingDeleteId;
		setPendingDeleteId(null);
		commit(removeExperience(draftRef.current, id), { flush: true });
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
						{entries.map((entry, index) => (
							<div
								key={entry.id}
								className="space-y-3 rounded-lg border border-border p-3"
							>
								<div className="flex flex-wrap gap-1">
									<Button
										type="button"
										size="sm"
										variant="ghost"
										disabled={index === 0}
										aria-label={t("cvEditor.experiences.moveUp")}
										onClick={() =>
											commit(moveExperience(draftRef.current, entry.id, "up"), {
												flush: true,
											})
										}
									>
										<ArrowUpIcon aria-hidden className="size-4" />
									</Button>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										disabled={index === entries.length - 1}
										aria-label={t("cvEditor.experiences.moveDown")}
										onClick={() =>
											commit(
												moveExperience(draftRef.current, entry.id, "down"),
												{ flush: true },
											)
										}
									>
										<ArrowDownIcon aria-hidden className="size-4" />
									</Button>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										aria-label={t("cvEditor.experiences.delete")}
										onClick={() => setPendingDeleteId(entry.id)}
									>
										<Trash2Icon aria-hidden className="size-4" />
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

									<Field>
										<FieldLabel htmlFor={`experience-${entry.id}-startMonth`}>
											{t("cvEditor.experiences.field.startMonth")}
										</FieldLabel>
										<Input
											id={`experience-${entry.id}-startMonth`}
											type="month"
											value={entry.startMonth}
											onBlur={flush}
											onChange={(event) =>
												patchEntry(entry.id, { startMonth: event.target.value })
											}
										/>
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
										<Field>
											<FieldLabel htmlFor={`experience-${entry.id}-endMonth`}>
												{t("cvEditor.experiences.field.endMonth")}
											</FieldLabel>
											<Input
												id={`experience-${entry.id}-endMonth`}
												type="month"
												value={entry.endMonth}
												onBlur={flush}
												onChange={(event) =>
													patchEntry(entry.id, {
														endMonth: event.target.value,
													})
												}
											/>
										</Field>
									)}

									<Field>
										<FieldLabel htmlFor={`experience-${entry.id}-description`}>
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
						))}
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
							<Button
								type="button"
								variant="outline"
								onClick={() => setPendingDeleteId(null)}
							>
								<XIcon data-icon="inline-start" />
								{t("cvEditor.experiences.deleteCancel")}
							</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={handleConfirmDelete}
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
