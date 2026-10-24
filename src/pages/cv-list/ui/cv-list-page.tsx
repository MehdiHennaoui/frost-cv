import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import {
	createCv as createCvInDb,
	deleteCv as deleteCvInDb,
} from "@/entities/cv/api/cv-repository";
import type { CreateCvInput, Cv } from "@/entities/cv/model/cv";
import { CreateCvModal } from "@/features/create-cv/ui/create-cv-modal";
import { DeleteCvConfirmModal } from "@/features/delete-cv";
import { formatUpdatedAt } from "@/shared/lib/timestamp";
import { Button } from "@/shared/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";

type CvListPageProps = {
	cvs: Cv[];
	createCv?: (input: CreateCvInput) => Promise<Cv>;
	deleteCv?: (id: string) => Promise<void>;
	onCreated: (cvId: string) => void;
	onDeleted: () => void | Promise<void>;
};

function CvCard({ cv, onDelete }: { cv: Cv; onDelete: (cv: Cv) => void }) {
	function handleDelete() {
		onDelete(cv);
	}

	return (
		<Card size="sm" className="h-full">
			<CardHeader>
				<CardTitle className="min-w-0 break-words">{cv.title}</CardTitle>
				<CardDescription>
					CV locale: {cv.locale} · Updated {formatUpdatedAt(cv.updatedAt)}
				</CardDescription>
				<CardAction>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						aria-label={`Delete this CV: ${cv.title}`}
						onClick={handleDelete}
					>
						<Trash2Icon data-icon="inline-start" aria-hidden />
						Delete this CV
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
	onCreated,
	onDeleted,
}: CvListPageProps) {
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
				<h1 className="font-semibold text-3xl tracking-tight">Your CVs</h1>
				<Button type="button" onClick={handleOpenCreate}>
					<PlusIcon data-icon="inline-start" />
					Create new CV
				</Button>
			</div>

			{cvs.length === 0 ? (
				<p className="mt-6 text-muted-foreground">No CVs yet.</p>
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
