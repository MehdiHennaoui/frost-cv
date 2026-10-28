import { LayoutListIcon, Trash2Icon, XIcon } from "lucide-react";
import { useRef, useState } from "react";

import { type Cv, saveCv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
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
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
	type CustomSection,
	customSectionEqual,
	customSectionOf,
	removeCustomSection,
	withCustomSection,
} from "../model/custom-section-fields";
import { useCvAutosave } from "../model/use-cv-autosave";
import { RichTextEditor } from "./rich-text-editor";

type CustomSectionFormProps = {
	cv: Cv;
	sectionId: string;
	onPersisted: (cv: Cv) => void;
};

export function CustomSectionForm({
	cv,
	sectionId,
	onPersisted,
}: CustomSectionFormProps) {
	const { t } = useAppTranslation();
	const initial =
		customSectionOf(cv.content, sectionId) ??
		({
			id: sectionId,
			title: "",
			description: "",
		} satisfies CustomSection);
	const draftRef = useRef(initial);
	const [draft, setDraft] = useState(initial);
	const [pendingDelete, setPendingDelete] = useState(false);

	const autosave = useCvAutosave({
		cv,
		onPersisted,
		initialSaved: initial,
		isEqual: customSectionEqual,
		apply: withCustomSection,
	});

	function schedule(patch: Partial<CustomSection>) {
		const next = { ...draftRef.current, ...patch };
		draftRef.current = next;
		setDraft(next);
		autosave.schedule(next);
	}

	function flush() {
		autosave.flush();
	}

	async function confirmDelete() {
		autosave.cancel();
		setPendingDelete(false);
		const next = await saveCv({
			...cv,
			content: removeCustomSection(cv.content, sectionId),
		});
		onPersisted(next);
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
						<Button
							type="button"
							size="sm"
							variant="ghost"
							onClick={() => setPendingDelete(true)}
						>
							<Trash2Icon data-icon="inline-start" />
							{t("cvEditor.customs.delete")}
						</Button>
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
									onBlur={flush}
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
									onBlur={flush}
									onChange={(html) => schedule({ description: html })}
								/>
							</Field>
						</FieldGroup>
					</CardContent>
				</Card>
			</form>

			{pendingDelete && (
				<Dialog
					open
					onOpenChange={(open) => {
						if (!open) {
							setPendingDelete(false);
						}
					}}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("cvEditor.customs.deleteTitle")}</DialogTitle>
							<DialogDescription>
								{t("cvEditor.customs.deleteDescription", {
									title: heading,
								})}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setPendingDelete(false)}
							>
								<XIcon data-icon="inline-start" />
								{t("cvEditor.customs.deleteCancel")}
							</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={() => {
									void confirmDelete();
								}}
							>
								<Trash2Icon data-icon="inline-start" />
								{t("cvEditor.customs.deleteConfirm")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
