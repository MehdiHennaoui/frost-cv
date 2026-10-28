import { createFileRoute } from "@tanstack/react-router";

import { getCv } from "@/entities/cv";
import { CvEditorPage } from "@/pages/cv-editor";
import { useAppTranslation } from "@/shared/i18n";
import { SidebarPortal } from "@/shared/lib/sidebar-portal";
import { Skeleton } from "@/shared/ui/skeleton";

export const Route = createFileRoute("/cvs_/$cvId")({
	ssr: false,
	loader: async ({ params }) => {
		const cv = await getCv(params.cvId);
		return { cv, pageTitle: cv?.title };
	},
	pendingComponent: CvEditorPending,
	component: CvEditorRoute,
});

export function CvEditorPending() {
	const { t } = useAppTranslation();

	return (
		<>
			<SidebarPortal>
				<div aria-hidden className="flex flex-col gap-3 p-2">
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
				</div>
			</SidebarPortal>
			<main
				aria-busy="true"
				className="flex flex-1 justify-center bg-muted/40 p-4 md:p-8"
			>
				<p className="sr-only">{t("cvEditor.loading")}</p>
				<div className="mx-auto w-full max-w-[8.5in] space-y-6 bg-white p-[0.6in] shadow-sm ring-1 ring-black/10">
					<Skeleton className="h-8 w-1/2" />
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			</main>
		</>
	);
}

function CvEditorRoute() {
	const { cv } = Route.useLoaderData();

	return <CvEditorPage cv={cv} />;
}
