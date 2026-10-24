import { createFileRoute } from "@tanstack/react-router";

import { listCvs } from "@/entities/cv";
import { CvListPage } from "@/pages/cv-list";
import { useAppTranslation } from "@/shared/i18n";

export const Route = createFileRoute("/cvs")({
	ssr: false,
	loader: async () => {
		const cvs = await listCvs();
		return { cvs };
	},
	pendingComponent: CvListPending,
	component: CvListRoute,
});

function CvListPending() {
	const { t } = useAppTranslation();

	return <p className="text-muted-foreground">{t("cvList.loading")}</p>;
}

function CvListRoute() {
	const { cvs } = Route.useLoaderData();

	return <CvListPage cvs={cvs} />;
}
