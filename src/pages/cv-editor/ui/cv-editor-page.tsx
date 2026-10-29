import type { DragEndEvent } from "@dnd-kit/core";
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { SidebarPortal } from "@/shared/lib/sidebar-portal";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Field, FieldLabel } from "@/shared/ui/field";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import {
	addCustomSection,
	customSectionOf,
} from "../model/custom-section-fields";
import { moveSection } from "../model/section-order";
import { CanadianCvPreview } from "./canadian-cv-preview";
import { CustomSectionForm } from "./custom-section-form";
import { EducationSectionForm } from "./education-section-form";
import { ExperiencesSectionForm } from "./experiences-section-form";
import { IdentityHeaderForm } from "./identity-header-form";
import { LanguagesSectionForm } from "./languages-section-form";

type MovableSectionKey = Exclude<SectionKey, "identity">;

type CvEditorPageProps = {
	cv: Cv | undefined;
};

function SortableSection({
	id,
	index,
	count,
	label,
	onMove,
	children,
}: {
	id: string;
	index: number;
	count: number;
	label: string;
	onMove: (toIndex: number) => void;
	children: ReactNode;
}) {
	const { t } = useAppTranslation();
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });
	const positionLabel = t("cvEditor.sections.position", { section: label });

	return (
		<div
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
			}}
			className="flex flex-col gap-2"
		>
			<div className="flex items-end justify-between gap-2">
				<Button
					type="button"
					size="icon-sm"
					variant="ghost"
					{...attributes}
					{...listeners}
					aria-label={t("cvEditor.sections.drag", { section: label })}
				>
					<GripVerticalIcon />
				</Button>
				<Field className="w-auto gap-1.5">
					<FieldLabel htmlFor={`section-${id}-position`}>
						{positionLabel}
					</FieldLabel>
					<NativeSelect
						id={`section-${id}-position`}
						size="sm"
						disabled={count < 2}
						value={String(index)}
						aria-label={positionLabel}
						onChange={(event) => {
							const toIndex = Number(event.target.value);
							if (Number.isNaN(toIndex)) {
								return;
							}
							onMove(toIndex);
						}}
					>
						{Array.from({ length: count }, (_, position) =>
							String(position),
						).map((value) => (
							<NativeSelectOption key={value} value={value}>
								{t("cvEditor.sections.positionOption", {
									n: Number(value) + 1,
								})}
							</NativeSelectOption>
						))}
					</NativeSelect>
				</Field>
			</div>
			{children}
		</div>
	);
}

function SectionBlock({
	sectionKey,
	cv,
	onPersisted,
}: {
	sectionKey: MovableSectionKey;
	cv: Cv;
	onPersisted: (cv: Cv) => void;
}) {
	if (sectionKey === "experiences") {
		return <ExperiencesSectionForm cv={cv} onPersisted={onPersisted} />;
	}
	if (sectionKey === "education") {
		return <EducationSectionForm cv={cv} onPersisted={onPersisted} />;
	}
	if (sectionKey === "languages") {
		return <LanguagesSectionForm cv={cv} onPersisted={onPersisted} />;
	}
	if (isCustomSectionKey(sectionKey)) {
		return (
			<CustomSectionForm
				cv={cv}
				sectionId={customSectionIdFromKey(sectionKey)}
				onPersisted={onPersisted}
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
	const order = sectionOrderOf(cv.content).filter(
		(key): key is MovableSectionKey => key !== "identity",
	);
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
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
		const next = await saveCv({ ...cv, content });
		onPersisted(next);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) {
			return;
		}
		const key = order.find((item) => item === active.id);
		const toIndex = order.findIndex((item) => item === over.id);
		if (!key || toIndex < 0) {
			return;
		}
		void persistSectionOrder(key, toIndex);
	}

	async function handleAddCustomSection() {
		const { content } = addCustomSection(cv.content);
		const next = await saveCv({ ...cv, content });
		onPersisted(next);
	}

	return (
		<div className="flex flex-col gap-4">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={order} strategy={verticalListSortingStrategy}>
					{order.map((key, index) => (
						<SortableSection
							key={key}
							id={key}
							index={index}
							count={order.length}
							label={labelFor(key)}
							onMove={(toIndex) => {
								void persistSectionOrder(key, toIndex);
							}}
						>
							<SectionBlock
								sectionKey={key}
								cv={cv}
								onPersisted={onPersisted}
							/>
						</SortableSection>
					))}
				</SortableContext>
			</DndContext>
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
