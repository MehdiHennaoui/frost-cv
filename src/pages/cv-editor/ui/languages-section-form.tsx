import { LanguagesIcon, PlusIcon, Trash2Icon } from "lucide-react";

import type { Cv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import {
	createEmptyLanguage,
	type LanguageEntry,
	languageEqual,
	languagesOf,
	withLanguages,
} from "../model/language-fields";
import { useCvEntryList } from "../model/use-cv-entry-list";
import { CvDeleteConfirmDialog } from "./cv-delete-confirm-dialog";

type LanguagesSectionFormProps = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
};

const TEXT_FIELDS = ["language", "level"] as const satisfies ReadonlyArray<
	keyof LanguageEntry
>;

export function LanguagesSectionForm({
	cv,
	onPersisted,
}: LanguagesSectionFormProps) {
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
		initial: languagesOf(cv.content),
		isEqual: languageEqual,
		apply: withLanguages,
		createEmpty: createEmptyLanguage,
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
							<LanguagesIcon aria-hidden className="size-4 shrink-0" />
							{t("cvEditor.section.languages")}
						</CardTitle>
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={handleAdd}
						>
							<PlusIcon data-icon="inline-start" />
							{t("cvEditor.languages.add")}
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						{entries.length === 0 && (
							<p className="text-muted-foreground text-sm">
								{t("cvEditor.languages.empty")}
							</p>
						)}
						{entries.map((entry, index) => (
							<div
								key={entry.id}
								className="space-y-3 rounded-lg border border-border p-3"
							>
								<div className="flex flex-wrap items-end justify-between gap-2">
									<Field className="w-auto gap-1.5">
										<FieldLabel htmlFor={`language-${entry.id}-position`}>
											{t("cvEditor.languages.position")}
										</FieldLabel>
										<NativeSelect
											id={`language-${entry.id}-position`}
											size="sm"
											disabled={entries.length < 2}
											value={String(index)}
											aria-label={t("cvEditor.languages.position")}
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
													{t("cvEditor.languages.positionOption", {
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
										{t("cvEditor.languages.delete")}
									</Button>
								</div>

								<FieldGroup className="gap-3">
									{TEXT_FIELDS.map((name) => (
										<Field key={name}>
											<FieldLabel htmlFor={`language-${entry.id}-${name}`}>
												{t(`cvEditor.languages.field.${name}`)}
											</FieldLabel>
											<Input
												id={`language-${entry.id}-${name}`}
												value={entry[name]}
												onBlur={flush}
												onChange={(event) =>
													patchEntry(entry.id, { [name]: event.target.value })
												}
											/>
										</Field>
									))}
								</FieldGroup>
							</div>
						))}
					</CardContent>
				</Card>
			</form>

			{pendingDelete && (
				<CvDeleteConfirmDialog
					title={t("cvEditor.languages.deleteTitle")}
					description={t("cvEditor.languages.deleteDescription", {
						title:
							pendingDelete.language ||
							pendingDelete.level ||
							t("cvEditor.languages.untitled"),
					})}
					cancelLabel={t("cvEditor.languages.deleteCancel")}
					confirmLabel={t("cvEditor.languages.deleteConfirm")}
					onCancel={cancelDelete}
					onConfirm={confirmDelete}
				/>
			)}
		</>
	);
}
