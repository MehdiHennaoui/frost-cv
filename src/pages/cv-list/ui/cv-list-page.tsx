import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { createCv as createCvInDb } from "@/entities/cv/api/cv-repository";
import type { CreateCvInput, Cv } from "@/entities/cv/model/cv";
import { CreateCvModal } from "@/features/create-cv/ui/create-cv-modal";
import { formatUpdatedAt } from "@/shared/lib/timestamp";
import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

type CvListPageProps = {
	cvs: Cv[];
	createCv?: (input: CreateCvInput) => Promise<Cv>;
	onCreated: (cvId: string) => void;
};

function CvCard({ cv }: { cv: Cv }) {
	return (
		<Card size="sm">
			<CardHeader>
				<CardTitle>{cv.title}</CardTitle>
				<CardDescription>
					CV locale: {cv.locale} · Updated {formatUpdatedAt(cv.updatedAt)}
				</CardDescription>
			</CardHeader>
		</Card>
	);
}

export function CvListPage({
	cvs,
	createCv = createCvInDb,
	onCreated,
}: CvListPageProps) {
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	function handleOpenCreate() {
		setIsCreateOpen(true);
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
						<li key={cv.id}>
							<CvCard cv={cv} />
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
		</>
	);
}
