import { type Cv, sectionOrderOf } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { SidebarPortal } from "@/shared/lib/sidebar-portal";
import { buttonVariants } from "@/shared/ui/button";
import { CanadianCvPreview } from "./canadian-cv-preview";

type CvEditorPageProps = {
	cv: Cv | undefined;
};

function SectionPlaceholders({ cv }: { cv: Cv }) {
	const { t } = useAppTranslation();
	const order = sectionOrderOf(cv.content);

	return (
		<ul className="flex flex-col gap-3">
			{order.map((key) => (
				<li
					key={key}
					className="rounded-lg border border-muted-foreground/40 border-dashed px-4 py-3 text-sm"
				>
					{t(`cvEditor.section.${key}`)}
				</li>
			))}
		</ul>
	);
}

function EditorSidebarContent({ cv }: { cv: Cv }) {
	const { t } = useAppTranslation();

	return (
		<div className="flex h-full flex-col gap-3 p-2">
			<div className="min-w-0 px-2">
				<p className="text-muted-foreground text-xs">
					{t("cvEditor.meta", { locale: cv.locale })}
				</p>
				<p className="mt-2 text-muted-foreground text-xs">
					{t("cvEditor.stubHint")}
				</p>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto px-2">
				<p className="mb-2 font-medium text-xs">{t("cvEditor.edit.label")}</p>
				<SectionPlaceholders cv={cv} />
			</div>
			<div className="border-sidebar-border border-t p-2">
				<a href="/cvs" className={buttonVariants({ variant: "outline" })}>
					{t("cvEditor.backToList")}
				</a>
			</div>
		</div>
	);
}

export function CvEditorPage({ cv }: CvEditorPageProps) {
	const { t } = useAppTranslation();

	if (!cv) {
		return (
			<main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 md:p-8">
				<p className="text-muted-foreground">{t("cvEditor.notFoundHint")}</p>
				<a href="/cvs" className={buttonVariants({ variant: "outline" })}>
					{t("cvEditor.backToList")}
				</a>
			</main>
		);
	}

	return (
		<>
			<SidebarPortal>
				<EditorSidebarContent cv={cv} />
			</SidebarPortal>
			<main className="flex flex-1 justify-center bg-muted/40 p-4 md:p-8">
				<CanadianCvPreview cv={cv} />
			</main>
		</>
	);
}
