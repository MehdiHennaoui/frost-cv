import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import {
	type CreateCvInput,
	type Cv,
	createCv as createCvInDb,
	deleteCv as deleteCvInDb,
} from "@/entities/cv";
import { isUiLocale, useAppTranslation } from "@/shared/i18n";
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

type CvListPageProps = {
	cvs: Cv[];
	createCv?: (input: CreateCvInput) => Promise<Cv>;
	deleteCv?: (id: string) => Promise<void>;
};

function CvCard({ cv, onDelete }: { cv: Cv; onDelete: (cv: Cv) => void }) {
	const { t, i18n } = useAppTranslation();
	const uiLocale = isUiLocale(i18n.language) ? i18n.language : "en";
	const formattedUpdatedAt = formatUpdatedAt(cv.updatedAt, uiLocale);
	const updatedAt =
		formattedUpdatedAt === "Unknown date"
			? t("cvList.unknownDate")
			: formattedUpdatedAt;

	function handleDelete() {
		onDelete(cv);
	}

	return (
		<Card size="sm" className="h-full">
			<CardHeader>
				<CardTitle className="min-w-0 break-words">{cv.title}</CardTitle>
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
	deleteCv = deleteCvInDb,
}: CvListPageProps) {
	const { t } = useAppTranslation();
	const { onCreated, onDeleted } = useCvListNavigation();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<Cv | null>(null);

	function handleOpenCreate() {
		setIsCreateOpen(true);
	}

	function handleRequestDelete(cv: Cv) {
		setPendingDelete(cv);
	}

	function handleDeleteOpenChange(open: boolean) {
		if (!open) {
			setPendingDelete(null);
		}
	}

	return (
		<>
			<div className="flex items-center justify-between gap-4">
				<h1 className="font-semibold text-3xl tracking-tight">
					{t("cvList.heading")}
				</h1>
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

			{pendingDelete && (
				<DeleteCvConfirmModal
					open
					cvId={pendingDelete.id}
					cvTitle={pendingDelete.title}
					onOpenChange={handleDeleteOpenChange}
					deleteCv={deleteCv}
					onDeleted={onDeleted}
				/>
			)}
		</>
	);
}
