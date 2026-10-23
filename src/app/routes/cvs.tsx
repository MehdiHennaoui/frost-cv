import { createFileRoute } from "@tanstack/react-router";

import { listCvs } from "@/entities/cv/api/cv-repository";
import { CvListPage } from "@/pages/cv-list/ui/cv-list-page";

export const Route = createFileRoute("/cvs")({
	ssr: false,
	loader: async () => {
		const cvs = await listCvs();
		return { cvs };
	},
	pendingComponent: () => <p className="text-muted-foreground">Loading CVs…</p>,
	component: CvListRoute,
});

function CvListRoute() {
	const { cvs } = Route.useLoaderData();
	return <CvListPage cvs={cvs} />;
}
