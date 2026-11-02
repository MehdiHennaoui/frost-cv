import {
	CopyIcon,
	DownloadIcon,
	FileUpIcon,
	FolderDownIcon,
	FolderUpIcon,
	ListChecksIcon,
	ListXIcon,
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
	importLibraryCvs as importLibraryCvsInDb,
	type LibraryImportMode,
	libraryExportFile,
} from "@/entities/cv";
import { useAppTranslation, useUiLocale } from "@/shared/i18n";
import { downloadTextFile } from "@/shared/lib/download-text-file";
import { formatUpdatedAt } from "@/shared/lib/timestamp";
import { Button } from "@/shared/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Link } from "@/shared/ui/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useCvListNavigation } from "../model/use-cv-list-navigation";
import { CreateCvModal } from "./create-cv-modal";
import { DeleteCvConfirmModal } from "./delete-cv-confirm-modal";
import { ImportCvModal } from "./import-cv-modal";
import { ImportLibraryModal } from "./import-library-modal";

type CvListPageProps = {
	cvs: Cv[];
	createCv?: (input: CreateCvInput) => Promise<Cv>;
	createCvFromImport?: (payload: CvImportPayload) => Promise<Cv>;
	importLibraryCvs?: (
		payloads: CvImportPayload[],
		mode: LibraryImportMode,
	) => Promise<Cv[]>;
	duplicateCv?: (sourceId: string, input: CreateCvInput) => Promise<Cv>;
	deleteCv?: (id: string) => Promise<void>;
	downloadFile?: (filename: string, text: string) => void;
};

function CvCard({
	cv,
	selected,
	onSelectedChange,
	onDelete,
	onDuplicate,
	onExport,
}: {
	cv: Cv;
	selected: boolean;
	onSelectedChange: (selected: boolean) => void;
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

	const selectLabel = t("cvList.selectNamed", { title: cv.title });
	const duplicateLabel = t("cvList.duplicateNamed", { title: cv.title });
	const exportLabel = t("cvList.exportNamed", { title: cv.title });
	const deleteLabel = t("cvList.deleteNamed", { title: cv.title });

	return (
		<Card size="sm" className="h-full">
			<CardHeader className="relative">
				<div className="relative z-10 flex items-start gap-2">
					<Checkbox
						className="z-20"
						checked={selected}
						aria-label={selectLabel}
						onCheckedChange={(checked) => {
							onSelectedChange(checked === true);
						}}
					/>
					<div className="min-w-0 flex-1">
						<CardTitle className="min-w-0 break-words">
							<Link
								to="/cvs/$cvId"
								params={{ cvId: cv.id }}
								className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:ring-2 focus-visible:ring-ring"
							>
								{cv.title}
							</Link>
						</CardTitle>
						<CardDescription className="pointer-events-none">
							{t("cvList.meta", { locale: cv.locale, updatedAt })}
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardFooter className="relative z-10 mt-auto justify-end gap-1">
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={duplicateLabel}
								onClick={handleDuplicate}
							/>
						}
					>
						<CopyIcon aria-hidden />
					</TooltipTrigger>
					<TooltipContent>{duplicateLabel}</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={exportLabel}
								onClick={handleExport}
							/>
						}
					>
						<DownloadIcon aria-hidden />
					</TooltipTrigger>
					<TooltipContent>{exportLabel}</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={deleteLabel}
								onClick={handleDelete}
							/>
						}
					>
						<Trash2Icon aria-hidden />
					</TooltipTrigger>
					<TooltipContent>{deleteLabel}</TooltipContent>
				</Tooltip>
			</CardFooter>
		</Card>
	);
}

export function CvListPage({
	cvs,
	createCv = createCvInDb,
	createCvFromImport = createCvFromImportInDb,
	importLibraryCvs = importLibraryCvsInDb,
	duplicateCv = duplicateCvInDb,
	deleteCv = deleteCvInDb,
	downloadFile = downloadTextFile,
}: CvListPageProps) {
	const { t } = useAppTranslation();
	const { onCreated, onDeleted, onLibraryImported } = useCvListNavigation();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isImportOpen, setIsImportOpen] = useState(false);
	const [isImportLibraryOpen, setIsImportLibraryOpen] = useState(false);
	const [cvToDelete, setCvToDelete] = useState<Cv | null>(null);
	const [cvToDuplicate, setCvToDuplicate] = useState<Cv | null>(null);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

	const allSelected = cvs.length > 0 && selectedIds.size === cvs.length;

	function handleOpenCreate() {
		setIsCreateOpen(true);
	}

	function handleOpenImport() {
		setIsImportOpen(true);
	}

	function handleOpenImportLibrary() {
		setIsImportLibraryOpen(true);
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

	function handleSelectedChange(cvId: string, selected: boolean) {
		setSelectedIds((previous) => {
			const next = new Set(previous);
			if (selected) {
				next.add(cvId);
			} else {
				next.delete(cvId);
			}
			return next;
		});
	}

	function handleToggleSelectAll() {
		if (allSelected) {
			setSelectedIds(new Set());
			return;
		}
		setSelectedIds(new Set(cvs.map((cv) => cv.id)));
	}

	function handleExportAll() {
		const file = libraryExportFile(cvs);
		downloadFile(file.filename, file.text);
		setSelectedIds(new Set());
	}

	function handleExportSelected() {
		const selected = cvs.filter((cv) => selectedIds.has(cv.id));
		const file = libraryExportFile(selected);
		downloadFile(file.filename, file.text);
		setSelectedIds(new Set());
	}

	async function handleDuplicateSubmit(input: CreateCvInput) {
		if (!cvToDuplicate) {
			throw new Error("duplicateCv.sourceMissing");
		}
		return duplicateCv(cvToDuplicate.id, input);
	}

	return (
		<main className="mx-auto max-w-6xl overflow-y-auto p-4 md:p-8">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap gap-2">
					{cvs.length > 0 && (
						<Button
							type="button"
							variant="outline"
							onClick={handleToggleSelectAll}
						>
							{allSelected ? (
								<ListXIcon data-icon="inline-start" />
							) : (
								<ListChecksIcon data-icon="inline-start" />
							)}
							{allSelected ? t("cvList.clearSelection") : t("cvList.selectAll")}
						</Button>
					)}
					<Button
						type="button"
						variant="outline"
						disabled={selectedIds.size === 0}
						onClick={handleExportSelected}
					>
						<DownloadIcon data-icon="inline-start" />
						{t("cvList.exportSelected")}
					</Button>
					<Button
						type="button"
						variant="outline"
						disabled={cvs.length === 0}
						onClick={handleExportAll}
					>
						<FolderDownIcon data-icon="inline-start" />
						{t("cvList.exportAll")}
					</Button>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={handleOpenImportLibrary}
					>
						<FolderUpIcon data-icon="inline-start" />
						{t("cvList.importLibrary")}
					</Button>
					<Button type="button" variant="outline" onClick={handleOpenImport}>
						<FileUpIcon data-icon="inline-start" />
						{t("cvList.import")}
					</Button>
					<Button type="button" onClick={handleOpenCreate}>
						<PlusIcon data-icon="inline-start" />
						{t("cvList.create")}
					</Button>
				</div>
			</div>

			{cvs.length === 0 ? (
				<p className="mt-6 text-muted-foreground">{t("cvList.empty")}</p>
			) : (
				<ul className="mt-6 grid gap-4 sm:grid-cols-2">
					{cvs.map((cv) => (
						<li key={cv.id} className="min-w-0">
							<CvCard
								cv={cv}
								selected={selectedIds.has(cv.id)}
								onSelectedChange={(selected) => {
									handleSelectedChange(cv.id, selected);
								}}
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

			<ImportLibraryModal
				open={isImportLibraryOpen}
				onOpenChange={setIsImportLibraryOpen}
				importLibraryCvs={importLibraryCvs}
				onImported={onLibraryImported}
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
