import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

import {
	type Cv,
	customSectionIdFromKey,
	isCustomSectionKey,
	saveCv,
	sectionOrderOf,
} from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { SidebarPortal } from "@/shared/lib/sidebar-portal";
import { Button, buttonVariants } from "@/shared/ui/button";
import { addCustomSection } from "../model/custom-section-fields";
import { CanadianCvPreview } from "./canadian-cv-preview";
import { CustomSectionForm } from "./custom-section-form";
import { EducationSectionForm } from "./education-section-form";
import { ExperiencesSectionForm } from "./experiences-section-form";
import { IdentityHeaderForm } from "./identity-header-form";
import { LanguagesSectionForm } from "./languages-section-form";

type CvEditorPageProps = {
	cv: Cv | undefined;
};

function EditorSidebarSections({
	cv,
	onPersisted,
}: {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
}) {
	const { t } = useAppTranslation();
	const order = sectionOrderOf(cv.content).filter((key) => key !== "identity");

	async function handleAddCustomSection() {
		const { content } = addCustomSection(cv.content);
		const next = await saveCv({ ...cv, content });
		onPersisted(next);
	}

	return (
		<div className="flex flex-col gap-4">
			{order.map((key) => {
				if (key === "experiences") {
					return (
						<ExperiencesSectionForm
							key={key}
							cv={cv}
							onPersisted={onPersisted}
						/>
					);
				}

				if (key === "education") {
					return (
						<EducationSectionForm key={key} cv={cv} onPersisted={onPersisted} />
					);
				}

				if (key === "languages") {
					return (
						<LanguagesSectionForm key={key} cv={cv} onPersisted={onPersisted} />
					);
				}

				if (isCustomSectionKey(key)) {
					return (
						<CustomSectionForm
							key={key}
							cv={cv}
							sectionId={customSectionIdFromKey(key)}
							onPersisted={onPersisted}
						/>
					);
				}

				return null;
			})}
			<Button
				type="button"
				size="sm"
				variant="outline"
				onClick={() => {
					void handleAddCustomSection();
				}}
			>
				<PlusIcon data-icon="inline-start" />
				{t("cvEditor.customs.add")}
			</Button>
		</div>
	);
}

function EditorSidebarContent({
	cv,
	onPersisted,
}: {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
}) {
	const { t } = useAppTranslation();

	return (
		<div className="flex h-full flex-col gap-3 p-2">
			<div className="min-w-0 px-2">
				<p className="text-muted-foreground text-xs">
					{t("cvEditor.meta", { locale: cv.locale })}
				</p>
			</div>
			<div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2">
				<p className="font-medium text-xs">{t("cvEditor.edit.label")}</p>
				<IdentityHeaderForm cv={cv} onPersisted={onPersisted} />
				<EditorSidebarSections cv={cv} onPersisted={onPersisted} />
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
	const [persistedCv, setPersistedCv] = useState(cv);

	useEffect(() => {
		setPersistedCv(cv);
	}, [cv]);

	if (!persistedCv) {
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
				<EditorSidebarContent cv={persistedCv} onPersisted={setPersistedCv} />
			</SidebarPortal>
			<main className="flex flex-1 justify-center bg-muted/40 p-4 md:p-8">
				<CanadianCvPreview cv={persistedCv} />
			</main>
		</>
	);
}
