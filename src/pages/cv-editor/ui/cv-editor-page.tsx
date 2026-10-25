import { type Cv, sectionOrderOf } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { buttonVariants } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useIsMdUp } from "../model/use-is-md-up";
import { CanadianCvPreview } from "./canadian-cv-preview";

type CvEditorPageProps = {
	cv: Cv | undefined;
};

function SectionPlaceholders({ cv }: { cv: Cv }) {
	const { t } = useAppTranslation();
	const order = sectionOrderOf(cv.content);

	return (
		<ul className="space-y-3">
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

function EditorPane({ cv }: { cv: Cv }) {
	const { t } = useAppTranslation();

	return (
		<section aria-label={t("cvEditor.edit.label")} className="space-y-4">
			<p className="text-muted-foreground text-sm">{t("cvEditor.stubHint")}</p>
			<SectionPlaceholders cv={cv} />
		</section>
	);
}

export function CvEditorPage({ cv }: CvEditorPageProps) {
	const { t } = useAppTranslation();
	const isMdUp = useIsMdUp();

	if (!cv) {
		return (
			<div className="space-y-4">
				<h1 className="font-semibold text-3xl tracking-tight">
					{t("cvEditor.notFound")}
				</h1>
				<p className="text-muted-foreground">{t("cvEditor.notFoundHint")}</p>
				<a href="/cvs" className={buttonVariants({ variant: "outline" })}>
					{t("cvEditor.backToList")}
				</a>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="min-w-0">
					<h1 className="truncate font-semibold text-3xl tracking-tight">
						{cv.title}
					</h1>
					<p className="text-muted-foreground text-sm">
						{t("cvEditor.meta", { locale: cv.locale })}
					</p>
				</div>
				<a href="/cvs" className={buttonVariants({ variant: "outline" })}>
					{t("cvEditor.backToList")}
				</a>
			</div>

			{isMdUp ? (
				<div className="grid gap-6 md:grid-cols-2">
					<EditorPane cv={cv} />
					<CanadianCvPreview cv={cv} />
				</div>
			) : (
				<Tabs defaultValue="edit">
					<TabsList className="w-full">
						<TabsTrigger value="edit" className="flex-1">
							{t("cvEditor.tab.edit")}
						</TabsTrigger>
						<TabsTrigger value="preview" className="flex-1">
							{t("cvEditor.tab.preview")}
						</TabsTrigger>
					</TabsList>
					<TabsContent value="edit" className="mt-4">
						<EditorPane cv={cv} />
					</TabsContent>
					<TabsContent value="preview" className="mt-4">
						<CanadianCvPreview cv={cv} />
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
