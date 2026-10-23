import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cvs_/$cvId")({
	ssr: false,
	component: CvEditorStubRoute,
});

function CvEditorStubRoute() {
	const { cvId } = Route.useParams();
	return (
		<>
			<h1 className="font-semibold text-3xl tracking-tight">CV editor</h1>
			<p className="mt-4 text-muted-foreground">
				Editing CV <span className="font-mono text-foreground">{cvId}</span>.
				Full editor arrives in a later ticket.
			</p>
		</>
	);
}
