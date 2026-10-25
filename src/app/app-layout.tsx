import { UiLocaleSwitch } from "@/shared/i18n";

type AppLayoutProps = {
	children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
	return (
		<main className="mx-auto min-h-dvh max-w-2xl overflow-y-auto p-4 md:p-8">
			<div className="mb-6 flex justify-end">
				<UiLocaleSwitch />
			</div>
			{children}
		</main>
	);
}
