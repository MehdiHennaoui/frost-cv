import { LanguagesIcon, PlusIcon, Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";

import type { Cv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
	createEmptyLanguage,
	type LanguageEntry,
	languageEqual,
	languagesOf,
	withLanguages,
} from "../model/language-fields";
import { flushOnFormLeave } from "../model/use-cv-autosave";
import { useCvEntryList } from "../model/use-cv-entry-list";
import { CvDeleteConfirmDialog } from "./cv-delete-confirm-dialog";
import { IconTooltipButton } from "./icon-tooltip-button";
import { PositionMenu } from "./position-menu";

type LanguagesSectionFormProps = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
	reorder?: ReactNode;
};

const TEXT_FIELDS = ["language", "level"] as const satisfies ReadonlyArray<
	keyof LanguageEntry
>;

export function LanguagesSectionForm({
	cv,
	onPersisted,
	reorder,
}: LanguagesSectionFormProps) {
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
						<CardTitle className="flex min-w-0 items-center gap-2">
							<LanguagesIcon aria-hidden className="size-4 shrink-0" />
							{t("cvEditor.section.languages")}
						</CardTitle>
						<div className="flex shrink-0 items-center gap-1">
							{reorder}
							<IconTooltipButton
								label={t("cvEditor.languages.add")}
								onClick={handleAdd}
							>
								<PlusIcon />
							</IconTooltipButton>
						</div>
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
								<div className="flex flex-wrap items-center justify-between gap-2">
									<PositionMenu
										label={t("cvEditor.languages.position")}
										index={index}
										count={entries.length}
										onMove={(toIndex) => moveEntry(entry.id, toIndex)}
										optionLabel={(position) =>
											t("cvEditor.languages.positionOption", {
												n: position + 1,
											})
										}
									/>
									<IconTooltipButton
										label={t("cvEditor.languages.delete")}
										onClick={() => requestDelete(entry.id)}
									>
										<Trash2Icon />
									</IconTooltipButton>
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
												onBlur={(event) => flushOnFormLeave(event, flush)}
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
					onCancel={cancelDelete}
					onConfirm={confirmDelete}
				/>
			)}
		</>
	);
}
