import { useNavigate, useRouter } from "@tanstack/react-router";

export function useCvListNavigation() {
	const router = useRouter();
	const navigate = useNavigate();

	async function onCreated(cvId: string) {
		await router.invalidate();
		await navigate({ to: "/cvs/$cvId", params: { cvId } });
	}

	async function invalidateList() {
		await router.invalidate();
	}

	return {
		onCreated,
		onDeleted: invalidateList,
		onLibraryImported: invalidateList,
	};
}
