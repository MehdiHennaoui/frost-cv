import {
	CopyIcon,
	DownloadIcon,
	FileUpIcon,
	PlusIcon,
	Trash2Icon,
} from "lucide-react";
import { useState } from "react";

import {
	type CreateCvInput,
	type Cv,
	type CvImportPayload,
	createCvFromImport as createCvFromImportInDb,
	createCv as createCvInDb,
	cvExportFile,
	deleteCv as deleteCvInDb,
	duplicateCv as duplicateCvInDb,
} from "@/entities/cv";
import { useAppTranslation, useUiLocale } from "@/shared/i18n";
import { downloadTextFile } from "@/shared/lib/download-text-file";
import { formatUpdatedAt } from "@/shared/lib/timestamp";
import { Button } from "@/shared/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { useCvListNavigation } from "../model/use-cv-list-navigation";
import { CreateCvModal } from "./create-cv-modal";
import { DeleteCvConfirmModal } from "./delete-cv-confirm-modal";
import { ImportCvModal } from "./import-cv-modal";

type CvListPageProps = {
	cvs: Cv[];
	createCv?: (input: CreateCvInput) => Promise<Cv>;
	createCvFromImport?: (payload: CvImportPayload) => Promise<Cv>;
	duplicateCv?: (sourceId: string, input: CreateCvInput) => Promise<Cv>;
	deleteCv?: (id: string) => Promise<void>;
	downloadFile?: (filename: string, text: string) => void;
};

function CvCard({
	cv,
	onDelete,
	onDuplicate,
	onExport,
}: {
	cv: Cv;
	onDelete: (cv: Cv) => void;
	onDuplicate: (cv: Cv) => void;
	onExport: (cv: Cv) => void;
}) {
	const { t } = useAppTranslation();
	const uiLocale = useUiLocale();
	const updatedAt =
		formatUpdatedAt(cv.updatedAt, uiLocale) ?? t("cvList.unknownDate");

	function handleDelete() {
		onDelete(cv);
	}

	function handleDuplicate() {
		onDuplicate(cv);
	}

	function handleExport() {
		onExport(cv);
	}

	return (
		<Card size="sm" className="h-full">
			<CardHeader>
				<CardTitle className="min-w-0 break-words">
					<a href={`/cvs/${cv.id}`} className="hover:underline">
						{cv.title}
					</a>
				</CardTitle>
				<CardDescription>
					{t("cvList.meta", { locale: cv.locale, updatedAt })}
				</CardDescription>
				<CardAction>
					<div className="flex flex-wrap justify-end gap-1">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							aria-label={t("cvList.duplicateNamed", { title: cv.title })}
							onClick={handleDuplicate}
						>
							<CopyIcon data-icon="inline-start" aria-hidden />
							{t("cvList.duplicate")}
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							aria-label={t("cvList.exportNamed", { title: cv.title })}
							onClick={handleExport}
						>
							<DownloadIcon data-icon="inline-start" aria-hidden />
							{t("cvList.export")}
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							aria-label={t("cvList.deleteNamed", { title: cv.title })}
							onClick={handleDelete}
						>
							<Trash2Icon data-icon="inline-start" aria-hidden />
							{t("cvList.delete")}
						</Button>
					</div>
				</CardAction>
			</CardHeader>
		</Card>
	);
}

export function CvListPage({
	cvs,
	createCv = createCvInDb,
	createCvFromImport = createCvFromImportInDb,
	duplicateCv = duplicateCvInDb,
	deleteCv = deleteCvInDb,
	downloadFile = downloadTextFile,
}: CvListPageProps) {
	const { t } = useAppTranslation();
	const { onCreated, onDeleted } = useCvListNavigation();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isImportOpen, setIsImportOpen] = useState(false);
	const [cvToDelete, setCvToDelete] = useState<Cv | null>(null);
	const [cvToDuplicate, setCvToDuplicate] = useState<Cv | null>(null);

	function handleOpenCreate() {
		setIsCreateOpen(true);
	}

	function handleOpenImport() {
		setIsImportOpen(true);
	}

	function handleRequestDelete(cv: Cv) {
		setCvToDelete(cv);
	}

	function handleRequestDuplicate(cv: Cv) {
		setCvToDuplicate(cv);
	}

	function handleDeleteOpenChange(open: boolean) {
		if (!open) {
			setCvToDelete(null);
		}
	}

	function handleDuplicateOpenChange(open: boolean) {
		if (!open) {
			setCvToDuplicate(null);
		}
	}

	function handleExport(cv: Cv) {
		const file = cvExportFile(cv);
		downloadFile(file.filename, file.text);
	}

	async function handleDuplicateSubmit(input: CreateCvInput) {
		if (!cvToDuplicate) {
			throw new Error("duplicateCv.sourceMissing");
		}
		return duplicateCv(cvToDuplicate.id, input);
	}

	return (
		<main className="mx-auto max-w-6xl overflow-y-auto p-4 md:p-8">
			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={handleOpenImport}>
					<FileUpIcon data-icon="inline-start" />
					{t("cvList.import")}
				</Button>
				<Button type="button" onClick={handleOpenCreate}>
					<PlusIcon data-icon="inline-start" />
					{t("cvList.create")}
				</Button>
			</div>

			{cvs.length === 0 ? (
				<p className="mt-6 text-muted-foreground">{t("cvList.empty")}</p>
			) : (
				<ul className="mt-6 grid gap-4 sm:grid-cols-2">
					{cvs.map((cv) => (
						<li key={cv.id} className="min-w-0">
							<CvCard
								cv={cv}
								onDelete={handleRequestDelete}
								onDuplicate={handleRequestDuplicate}
								onExport={handleExport}
							/>
						</li>
					))}
				</ul>
			)}

			<CreateCvModal
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				submitCv={createCv}
				onCreated={onCreated}
			/>

			{cvToDuplicate && (
				<CreateCvModal
					key={cvToDuplicate.id}
					open
					onOpenChange={handleDuplicateOpenChange}
					variant="duplicate"
					defaultValues={{
						title: `${cvToDuplicate.title}${t("duplicateCv.titleSuffix")}`,
						locale: cvToDuplicate.locale,
					}}
					submitCv={handleDuplicateSubmit}
					onCreated={onCreated}
				/>
			)}

			<ImportCvModal
				open={isImportOpen}
				onOpenChange={setIsImportOpen}
				createCvFromImport={createCvFromImport}
				onCreated={onCreated}
			/>

			{cvToDelete && (
				<DeleteCvConfirmModal
					open
					cvId={cvToDelete.id}
					cvTitle={cvToDelete.title}
					onOpenChange={handleDeleteOpenChange}
					deleteCv={deleteCv}
					onDeleted={onDeleted}
				/>
			)}
		</main>
	);
}
