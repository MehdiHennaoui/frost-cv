import { createFileRoute } from "@tanstack/react-router";

import { getCv } from "@/entities/cv";
import { CvEditorPage } from "@/pages/cv-editor";
import { useAppTranslation } from "@/shared/i18n";

export const Route = createFileRoute("/cvs_/$cvId")({
	ssr: false,
	loader: async ({ params }) => {
		const cv = await getCv(params.cvId);
		return { cv, pageTitle: cv?.title };
	},
	pendingComponent: CvEditorPending,
	component: CvEditorRoute,
});

function CvEditorPending() {
	const { t } = useAppTranslation();

	return <p className="text-muted-foreground">{t("cvEditor.loading")}</p>;
}

function CvEditorRoute() {
	const { cv } = Route.useLoaderData();

	return <CvEditorPage cv={cv} />;
}
