import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { GripVerticalIcon, PlusIcon } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import {
	type Cv,
	customSectionIdFromKey,
	isCustomSectionKey,
	type SectionKey,
	saveCv,
	sectionOrderOf,
} from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { SidebarPortal } from "@/shared/lib/sidebar-portal";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import {
	addCustomSection,
	customSectionOf,
} from "../model/custom-section-fields";
import {
	CvSavePendingProvider,
	useCvSavePending,
} from "../model/cv-save-pending";
import { moveSection } from "../model/section-order";
import { CanadianCvPreview } from "./canadian-cv-preview";
import { CustomSectionForm } from "./custom-section-form";
import { EducationSectionForm } from "./education-section-form";
import { ExperiencesSectionForm } from "./experiences-section-form";
import { IconTooltipButton } from "./icon-tooltip-button";
import { IdentityHeaderForm } from "./identity-header-form";
import { LanguagesSectionForm } from "./languages-section-form";
import { PositionMenu } from "./position-menu";
import { ReorderList } from "./reorder-list";

type MovableSectionKey = Exclude<SectionKey, "identity">;

type CvEditorPageProps = {
	cv: Cv | undefined;
};

function SectionReorderControls({
	index,
	count,
	label,
	onMove,
	dragAttributes,
	dragListeners,
}: {
	index: number;
	count: number;
	label: string;
	onMove: (toIndex: number) => void;
	dragAttributes: DraggableAttributes;
	dragListeners: DraggableSyntheticListeners | undefined;
}) {
	const { t } = useAppTranslation();
	const positionLabel = t("cvEditor.sections.position", { section: label });

	return (
		<>
			<IconTooltipButton
				label={t("cvEditor.sections.drag", { section: label })}
				{...dragAttributes}
				{...dragListeners}
			>
				<GripVerticalIcon />
			</IconTooltipButton>
			<PositionMenu
				label={positionLabel}
				index={index}
				count={count}
				onMove={onMove}
				optionLabel={(position) =>
					t("cvEditor.sections.positionOption", { n: position + 1 })
				}
			/>
		</>
	);
}

function SectionBlock({
	sectionKey,
	cv,
	onPersisted,
	reorder,
}: {
	sectionKey: MovableSectionKey;
	cv: Cv;
	onPersisted: (cv: Cv) => void;
	reorder: ReactNode;
}) {
	if (sectionKey === "experiences") {
		return (
			<ExperiencesSectionForm
				cv={cv}
				onPersisted={onPersisted}
				reorder={reorder}
			/>
		);
	}
	if (sectionKey === "education") {
		return (
			<EducationSectionForm
				cv={cv}
				onPersisted={onPersisted}
				reorder={reorder}
			/>
		);
	}
	if (sectionKey === "languages") {
		return (
			<LanguagesSectionForm
				cv={cv}
				onPersisted={onPersisted}
				reorder={reorder}
			/>
		);
	}
	if (isCustomSectionKey(sectionKey)) {
		return (
			<CustomSectionForm
				cv={cv}
				sectionId={customSectionIdFromKey(sectionKey)}
				onPersisted={onPersisted}
				reorder={reorder}
			/>
		);
	}
	return null;
}

function EditorSidebarSections({
	cv,
	onPersisted,
}: {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
}) {
	const { t } = useAppTranslation();
	const { withCvSavePending } = useCvSavePending();
	const order = sectionOrderOf(cv.content).filter(
		(key): key is MovableSectionKey => key !== "identity",
	);
	function labelFor(key: MovableSectionKey): string {
		if (isCustomSectionKey(key)) {
			return (
				customSectionOf(
					cv.content,
					customSectionIdFromKey(key),
				)?.title.trim() || t("cvEditor.customs.untitled")
			);
		}
		return t(`cvEditor.section.${key}`);
	}

	async function persistSectionOrder(key: MovableSectionKey, toIndex: number) {
		const content = moveSection(cv.content, key, toIndex);
		if (content === cv.content) {
			return;
		}
		await withCvSavePending(async () => {
			const next = await saveCv({ ...cv, content });
			onPersisted(next);
		});
	}

	async function handleAddCustomSection() {
		const { content } = addCustomSection(cv.content);
		await withCvSavePending(async () => {
			const next = await saveCv({ ...cv, content });
			onPersisted(next);
		});
	}

	return (
		<div className="flex flex-col gap-4">
			<ReorderList
				items={order.map((id) => ({ id }))}
				onMove={(id, toIndex) => {
					const key = order.find((item) => item === id);
					if (!key) {
						return;
					}
					void persistSectionOrder(key, toIndex);
				}}
				renderItem={(item, index, drag) => (
					<SectionBlock
						sectionKey={item.id}
						cv={cv}
						onPersisted={onPersisted}
						reorder={
							<SectionReorderControls
								index={index}
								count={order.length}
								label={labelFor(item.id)}
								onMove={(toIndex) => {
									void persistSectionOrder(item.id, toIndex);
								}}
								dragAttributes={drag.attributes}
								dragListeners={drag.listeners}
							/>
						}
					/>
				)}
			/>
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
	const { isCvSavePending } = useCvSavePending();

	return (
		<div className="flex h-full flex-col gap-3 p-2">
			<div className="min-w-0 px-2">
				<p className="text-muted-foreground text-xs">
					{t("cvEditor.meta", { locale: cv.locale })}
				</p>
				{isCvSavePending && (
					<output className="mt-1 flex items-center gap-1.5 text-muted-foreground text-xs">
						<Spinner aria-hidden className="size-3" role="presentation" />
						{t("cvEditor.saving")}
					</output>
				)}
			</div>
			<div
				aria-busy={isCvSavePending || undefined}
				className={cn(
					"min-h-0 flex-1 space-y-4 overflow-y-auto px-2",
					isCvSavePending && "opacity-60",
				)}
				inert={isCvSavePending || undefined}
			>
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
		<CvSavePendingProvider>
			<SidebarPortal>
				<EditorSidebarContent cv={persistedCv} onPersisted={setPersistedCv} />
			</SidebarPortal>
			<main className="flex flex-1 justify-center bg-muted/40 p-4 md:p-8">
				<CanadianCvPreview cv={persistedCv} />
			</main>
		</CvSavePendingProvider>
	);
}
