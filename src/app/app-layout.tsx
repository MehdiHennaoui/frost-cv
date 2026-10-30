import { useRouterState } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import {
	UiLocaleSwitch,
	useAppTranslation,
	useStoredUiLocale,
} from "@/shared/i18n";
import {
	SidebarPortalProvider,
	useSidebarPortalHost,
} from "@/shared/lib/sidebar-portal";
import {
	Sidebar,
	SidebarContent,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/shared/ui/sidebar";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { resolveRoutePageTitle } from "./route-page-titles";

type AppLayoutProps = {
	children: React.ReactNode;
};

function useIsCvEditorRoute(): boolean {
	return useRouterState({
		select: (state) =>
			state.matches.some((match) => match.routeId === "/cvs_/$cvId"),
	});
}

function useRoutePageTitle(): string {
	const { t } = useAppTranslation();
	const leaf = useRouterState({
		select: (state) => state.matches.at(-1),
	});

	const loaderData = leaf?.loaderData as { pageTitle?: string } | undefined;

	return resolveRoutePageTitle(
		leaf && {
			routeId: leaf.routeId,
			status: leaf.status,
			pageTitle: loaderData?.pageTitle,
		},
		(key) => t(key),
	);
}

function AppShell({ children }: { children: React.ReactNode }) {
	useStoredUiLocale();
	const { setHost } = useSidebarPortalHost();
	const isCvEditor = useIsCvEditorRoute();
	const title = useRoutePageTitle();

	return (
		<TooltipProvider>
			<SidebarProvider
				key={isCvEditor ? "cv-editor" : "default"}
				defaultOpen={isCvEditor}
				className="min-h-dvh print:min-h-0"
				style={
					{
						"--sidebar-width": isCvEditor ? "50vw" : "24rem",
						"--sidebar-width-mobile": "20rem",
					} as CSSProperties
				}
			>
				<Sidebar collapsible="offcanvas" data-testid="app-sidebar">
					<SidebarContent>
						<div
							ref={setHost}
							data-testid="app-sidebar-portal"
							className="flex min-h-0 flex-1 flex-col gap-2 p-2"
						/>
					</SidebarContent>
				</Sidebar>
				<SidebarInset className="print:bg-white">
					<header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 print:hidden">
						{isCvEditor && <SidebarTrigger />}
						<h1 className="min-w-0 flex-1 truncate font-bold text-lg tracking-tight">
							{title}
						</h1>
						<UiLocaleSwitch />
					</header>
					<div className="min-h-0 flex-1 overflow-y-auto print:overflow-visible print:bg-white">
						{children}
					</div>
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	);
}

export function AppLayout({ children }: AppLayoutProps) {
	return (
		<SidebarPortalProvider>
			<AppShell>{children}</AppShell>
		</SidebarPortalProvider>
	);
}
