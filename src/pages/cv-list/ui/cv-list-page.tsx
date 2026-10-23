import { useState } from "react";

import { createCv as createCvInDb } from "@/entities/cv/api/cv-repository";
import type { CreateCvInput, Cv } from "@/entities/cv/model/cv";
import { CreateCvModal } from "@/features/create-cv/ui/create-cv-modal";
import { formatUpdatedAt } from "@/shared/lib/timestamp";
import { Button } from "@/shared/ui/button";

type CvListPageProps = {
	cvs: Cv[];
	createCv?: (input: CreateCvInput) => Promise<Cv>;
	onCreated: (cvId: string) => void;
};

export function CvListPage({
	cvs,
	createCv = createCvInDb,
	onCreated,
}: CvListPageProps) {
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	return (
		<>
			<div className="flex items-center justify-between gap-4">
				<h1 className="font-semibold text-3xl tracking-tight">Your CVs</h1>
				<Button type="button" onClick={() => setIsCreateOpen(true)}>
					Create
				</Button>
			</div>

			{cvs.length === 0 ? (
				<p className="mt-6 text-muted-foreground">No CVs yet.</p>
			) : (
				<ul className="mt-6 divide-y divide-border border-border border-t">
					{cvs.map((cv) => (
						<li key={cv.id} className="flex flex-col gap-1 py-4">
							<span className="font-medium text-lg">{cv.title}</span>
							<span className="text-muted-foreground text-sm">
								CV locale: {cv.locale} · Updated {formatUpdatedAt(cv.updatedAt)}
							</span>
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
