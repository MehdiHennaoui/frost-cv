import type { Cv } from "@/entities/cv/model/cv";
import { formatUpdatedAt } from "@/shared/lib/timestamp";

type CvListPageProps = {
	cvs: Cv[];
};

export function CvListPage({ cvs }: CvListPageProps) {
	return (
		<>
			<h1 className="font-semibold text-3xl tracking-tight">Your CVs</h1>

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
		</>
	);
}
