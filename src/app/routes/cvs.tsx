import { createFileRoute } from "@tanstack/react-router";

import { listCvs } from "@/entities/cv";
import { CvListPage } from "@/pages/cv-list";
import { useAppTranslation } from "@/shared/i18n";
import { Skeleton } from "@/shared/ui/skeleton";

export const Route = createFileRoute("/cvs")({
	ssr: false,
	loader: async () => {
		const cvs = await listCvs();
		return { cvs };
	},
	pendingComponent: CvListPending,
	component: CvListRoute,
});

export function CvListPending() {
	const { t } = useAppTranslation();

	return (
		<main
			aria-busy="true"
			className="mx-auto max-w-6xl overflow-y-auto p-4 md:p-8"
		>
			<p className="sr-only">{t("cvList.loading")}</p>
			<div className="flex justify-end">
				<Skeleton className="h-9 w-36" />
			</div>
			<ul className="mt-6 grid gap-4 sm:grid-cols-2">
				{["card-1", "card-2", "card-3", "card-4"].map((id) => (
					<li key={id}>
						<Skeleton className="h-24 w-full" />
					</li>
				))}
			</ul>
		</main>
	);
}

function CvListRoute() {
	const { cvs } = Route.useLoaderData();

	return <CvListPage cvs={cvs} />;
}
