import { LayoutListIcon, Trash2Icon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { type Cv, saveCv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
	type CustomSection,
	customSectionEqual,
	customSectionOf,
	removeCustomSection,
	withCustomSection,
} from "../model/custom-section-fields";
import { useCvSavePending } from "../model/cv-save-pending";
import { flushOnFormLeave } from "../model/use-cv-autosave";
import { useCvSectionDraft } from "../model/use-cv-section-draft";
import { CvDeleteConfirmDialog } from "./cv-delete-confirm-dialog";
import { IconTooltipButton } from "./icon-tooltip-button";
import { RichTextEditor } from "./rich-text-editor";

type CustomSectionFormProps = {
	cv: Cv;
	sectionId: string;
	onPersisted: (cv: Cv) => void;
	reorder?: ReactNode;
};

export function CustomSectionForm({
	cv,
	sectionId,
	onPersisted,
	reorder,
}: CustomSectionFormProps) {
	const { t } = useAppTranslation();
	const { withCvSavePending } = useCvSavePending();
	const initial =
		customSectionOf(cv.content, sectionId) ??
		({
			id: sectionId,
			title: "",
			description: "",
		} satisfies CustomSection);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const { draft, schedule, flush, cancel } = useCvSectionDraft({
		cv,
		onPersisted,
		initial,
		isEqual: customSectionEqual,
		apply: withCustomSection,
	});

	async function confirmDelete() {
		cancel();
		setDeleteDialogOpen(false);
		await withCvSavePending(async () => {
			const next = await saveCv({
				...cv,
				content: removeCustomSection(cv.content, sectionId),
			});
			onPersisted(next);
		});
	}

	const heading = draft.title.trim() || t("cvEditor.customs.untitled");

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
							<LayoutListIcon aria-hidden className="size-4 shrink-0" />
							<span className="truncate">{heading}</span>
						</CardTitle>
						<div className="flex shrink-0 items-center gap-1">
							{reorder}
							<IconTooltipButton
								label={t("cvEditor.customs.delete")}
								onClick={() => setDeleteDialogOpen(true)}
							>
								<Trash2Icon />
							</IconTooltipButton>
						</div>
					</CardHeader>
					<CardContent>
						<FieldGroup className="gap-3">
							<Field>
								<FieldLabel htmlFor={`custom-${sectionId}-title`}>
									{t("cvEditor.customs.field.title")}
								</FieldLabel>
								<Input
									id={`custom-${sectionId}-title`}
									value={draft.title}
									onBlur={(event) => flushOnFormLeave(event, flush)}
									onChange={(event) => schedule({ title: event.target.value })}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor={`custom-${sectionId}-description`}>
									{t("cvEditor.customs.field.description")}
								</FieldLabel>
								<RichTextEditor
									id={`custom-${sectionId}-description`}
									value={draft.description}
									onBlur={() => flushOnFormLeave(undefined, flush)}
									onChange={(html) => schedule({ description: html })}
								/>
							</Field>
						</FieldGroup>
					</CardContent>
				</Card>
			</form>

			{deleteDialogOpen && (
				<CvDeleteConfirmDialog
					title={t("cvEditor.customs.deleteTitle")}
					description={t("cvEditor.customs.deleteDescription", {
						title: heading,
					})}
					cancelLabel={t("cvEditor.customs.deleteCancel")}
					confirmLabel={t("cvEditor.customs.deleteConfirm")}
					onCancel={() => setDeleteDialogOpen(false)}
					onConfirm={() => {
						void confirmDelete();
					}}
				/>
			)}
		</>
	);
}
