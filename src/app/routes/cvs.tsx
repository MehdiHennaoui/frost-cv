import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";

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
	const navigate = useNavigate();
	const router = useRouter();

	return (
		<CvListPage
			cvs={cvs}
			onCreated={(cvId) => {
				void router
					.invalidate()
					.then(() => navigate({ to: "/cvs/$cvId", params: { cvId } }));
			}}
		/>
	);
}
