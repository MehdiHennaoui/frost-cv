import { FileUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import {
	type CreateCvInput,
	type Cv,
	type CvImportPayload,
	createCvFromImport as createCvFromImportInDb,
	createCv as createCvInDb,
	deleteCv as deleteCvInDb,
} from "@/entities/cv";
import { useAppTranslation, useUiLocale } from "@/shared/i18n";
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
	deleteCv?: (id: string) => Promise<void>;
};

function CvCard({ cv, onDelete }: { cv: Cv; onDelete: (cv: Cv) => void }) {
	const { t } = useAppTranslation();
	const uiLocale = useUiLocale();
	const updatedAt =
		formatUpdatedAt(cv.updatedAt, uiLocale) ?? t("cvList.unknownDate");

	function handleDelete() {
		onDelete(cv);
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
				</CardAction>
			</CardHeader>
		</Card>
	);
}

export function CvListPage({
	cvs,
	createCv = createCvInDb,
	createCvFromImport = createCvFromImportInDb,
	deleteCv = deleteCvInDb,
}: CvListPageProps) {
	const { t } = useAppTranslation();
	const { onCreated, onDeleted } = useCvListNavigation();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isImportOpen, setIsImportOpen] = useState(false);
	const [cvToDelete, setCvToDelete] = useState<Cv | null>(null);

	function handleOpenCreate() {
		setIsCreateOpen(true);
	}

	function handleOpenImport() {
		setIsImportOpen(true);
	}

	function handleRequestDelete(cv: Cv) {
		setCvToDelete(cv);
	}

	function handleDeleteOpenChange(open: boolean) {
		if (!open) {
			setCvToDelete(null);
		}
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
							<CvCard cv={cv} onDelete={handleRequestDelete} />
						</li>
					))}
				</ul>
			)}

			<CreateCvModal
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				createCv={createCv}
				onCreated={onCreated}
			/>

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
