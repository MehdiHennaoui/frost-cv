import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
	DownloadIcon,
	FileUpIcon,
	GripVerticalIcon,
	PlusIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import {
	type Cv,
	type CvImportPayload,
	customSectionIdFromKey,
	cvExportFile,
	isCustomSectionKey,
	replaceCvFromImport as replaceCvFromImportInDb,
	type SectionKey,
	sectionOrderOf,
} from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { downloadTextFile } from "@/shared/lib/download-text-file";
import { SidebarPortal } from "@/shared/lib/sidebar-portal";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Link } from "@/shared/ui/link";
import { Spinner } from "@/shared/ui/spinner";
import {
	EditorForm,
	EditorFormProvider,
	useEditorForm,
	useEditorValues,
	useHydrateEditorForm,
} from "../model/form/editor-form-context";
import {
	scrollToHashTarget,
	useLocationHash,
} from "../model/nav/use-location-hash";
import {
	CvSavePendingProvider,
	useIsCvSavePending,
	useWithCvSavePending,
} from "../model/save/cv-save-pending";
import {
	addCustomSection,
	customSectionsOf,
} from "../model/sections/custom-section-fields";
import { moveSection } from "../model/sections/section-order";
import { EntryDeleteConfirmProvider } from "./entries/entry-delete-confirm-context";
import { PositionMenu } from "./entries/position-menu";
import { ReorderList } from "./entries/reorder-list";
import { ReactPdfPreview } from "./preview/react-pdf-preview";
import { CustomSectionForm } from "./sections/custom-section-form";
import { EducationSectionForm } from "./sections/education-section-form";
import { ExperiencesSectionForm } from "./sections/experiences-section-form";
import { IdentityHeaderForm } from "./sections/identity-header-form";
import { LanguagesSectionForm } from "./sections/languages-section-form";
import { BackToListLink } from "./shell/back-to-list-link";
import { GoToCommand } from "./shell/go-to-command";
import { IconTooltipButton } from "./shell/icon-tooltip-button";
import { ReplaceCvImportDialog } from "./shell/replace-cv-import-dialog";

type MovableSectionKey = Exclude<SectionKey, "identity">;

type CvEditorPageProps = {
	cv: Cv | undefined;
	replaceCvFromImport?: (id: string, payload: CvImportPayload) => Promise<Cv>;
	downloadFile?: (filename: string, text: string) => void;
};

function SectionReorderControls({
	index,
	count,
	onMove,
	dragAttributes,
	dragListeners,
	disabled = false,
}: {
	index: number;
	count: number;
	onMove: (toIndex: number) => void;
	dragAttributes: DraggableAttributes;
	dragListeners: DraggableSyntheticListeners | undefined;
	disabled?: boolean;
}) {
	const { t } = useAppTranslation();

	return (
		<>
			<PositionMenu
				label={t("cvEditor.sections.position")}
				index={index}
				count={count}
				disabled={disabled}
				onMove={onMove}
				optionLabel={(position) =>
					t("cvEditor.sections.positionOption", { n: position + 1 })
				}
			/>
			<IconTooltipButton
				label={t("cvEditor.sections.drag")}
				{...dragAttributes}
				{...dragListeners}
				disabled={disabled}
			>
				<GripVerticalIcon />
			</IconTooltipButton>
		</>
	);
}

function SectionBlock({
	sectionKey,
	reorder,
}: {
	sectionKey: MovableSectionKey;
	reorder: ReactNode;
}) {
	if (sectionKey === "experiences") {
		return <ExperiencesSectionForm reorder={reorder} />;
	}
	if (sectionKey === "education") {
		return <EducationSectionForm reorder={reorder} />;
	}
	if (sectionKey === "languages") {
		return <LanguagesSectionForm reorder={reorder} />;
	}
	if (isCustomSectionKey(sectionKey)) {
		return (
			<CustomSectionForm
				sectionId={customSectionIdFromKey(sectionKey)}
				reorder={reorder}
			/>
		);
	}
	return null;
}

function EditorSidebarSections() {
	const { t } = useAppTranslation();
	const form = useEditorForm();
	const isCvSavePending = useIsCvSavePending();
	const order = useEditorValues().sectionOrder.filter(
		(key): key is MovableSectionKey => key !== "identity",
	);

	function persistSectionOrder(key: MovableSectionKey, toIndex: number) {
		const content = moveSection(form.state.values, key, toIndex);
		if (content === form.state.values) {
			return;
		}
		form.setFieldValue("sectionOrder", sectionOrderOf(content));
	}

	function handleAddCustomSection() {
		const { content } = addCustomSection(form.state.values);
		form.setFieldValue("customSections", customSectionsOf(content));
		form.setFieldValue("sectionOrder", sectionOrderOf(content));
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
						reorder={
							<SectionReorderControls
								index={index}
								count={order.length}
								disabled={isCvSavePending}
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
				disabled={isCvSavePending}
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
	onExport,
	onOpenImport,
	isImportOpen,
}: {
	cv: Cv;
	onExport: () => void;
	onOpenImport: () => void;
	isImportOpen: boolean;
}) {
	const { t } = useAppTranslation();
	const isCvSavePending = useIsCvSavePending();
	const isLocked = isCvSavePending || isImportOpen;
	const hash = useLocationHash();

	useEffect(() => {
		if (!hash) {
			return;
		}
		scrollToHashTarget(hash);
	}, [hash]);

	return (
		<div className="flex h-full flex-col gap-3 p-2">
			<div className="flex items-start justify-between gap-2 px-2">
				<div className="min-w-0">
					<p className="text-muted-foreground text-xs">
						{t("cvEditor.meta", { locale: cv.locale })}
					</p>
					<div className="mt-1 flex h-4 items-center gap-1.5 text-muted-foreground text-xs">
						{isCvSavePending && (
							<output className="flex items-center gap-1.5">
								<Spinner aria-hidden className="size-3" role="presentation" />
								{t("cvEditor.saving")}
							</output>
						)}
					</div>
				</div>
				<div className="flex shrink-0 items-center gap-1">
					<BackToListLink />
					<GoToCommand content={cv.content} disabled={isLocked} />
					<IconTooltipButton
						label={t("cvExport.export")}
						disabled={isLocked}
						onClick={onExport}
					>
						<DownloadIcon />
					</IconTooltipButton>
					<IconTooltipButton
						label={t("cvExport.replace")}
						disabled={isLocked}
						onClick={onOpenImport}
					>
						<FileUpIcon />
					</IconTooltipButton>
				</div>
			</div>
			<div
				aria-busy={isImportOpen || undefined}
				className={cn("min-h-0 flex-1 space-y-4 overflow-y-auto px-2", {
					"opacity-60": isImportOpen,
				})}
				inert={isImportOpen || undefined}
			>
				<p className="font-medium text-xs">{t("cvEditor.edit.label")}</p>
				<EditorForm>
					<IdentityHeaderForm />
					<EditorSidebarSections />
				</EditorForm>
			</div>
		</div>
	);
}

function CvEditorLoaded({
	cv,
	replaceCvFromImport,
	downloadFile,
}: {
	cv: Cv;
	replaceCvFromImport: (id: string, payload: CvImportPayload) => Promise<Cv>;
	downloadFile: (filename: string, text: string) => void;
}) {
	const [persistedCv, setPersistedCv] = useState(cv);
	const [isImportOpen, setIsImportOpen] = useState(false);
	const withCvSavePending = useWithCvSavePending();

	if (persistedCv.id !== cv.id) {
		setPersistedCv(cv);
	}

	return (
		<EditorFormProvider
			key={cv.id}
			cv={persistedCv.id === cv.id ? persistedCv : cv}
			onPersisted={setPersistedCv}
		>
			<EntryDeleteConfirmProvider>
				<CvEditorLoadedForm
					persistedCv={persistedCv}
					setPersistedCv={setPersistedCv}
					isImportOpen={isImportOpen}
					setIsImportOpen={setIsImportOpen}
					replaceCvFromImport={replaceCvFromImport}
					downloadFile={downloadFile}
					withCvSavePending={withCvSavePending}
				/>
			</EntryDeleteConfirmProvider>
		</EditorFormProvider>
	);
}

function CvEditorLoadedForm({
	persistedCv,
	setPersistedCv,
	isImportOpen,
	setIsImportOpen,
	replaceCvFromImport,
	downloadFile,
	withCvSavePending,
}: {
	persistedCv: Cv;
	setPersistedCv: (cv: Cv) => void;
	isImportOpen: boolean;
	setIsImportOpen: (open: boolean) => void;
	replaceCvFromImport: (id: string, payload: CvImportPayload) => Promise<Cv>;
	downloadFile: (filename: string, text: string) => void;
	withCvSavePending: <T>(task: () => Promise<T>) => Promise<T>;
}) {
	const hydrateFromCv = useHydrateEditorForm();

	function handleExport() {
		const file = cvExportFile(persistedCv);
		downloadFile(file.filename, file.text);
	}

	return (
		<>
			<SidebarPortal>
				<EditorSidebarContent
					cv={persistedCv}
					onExport={handleExport}
					onOpenImport={() => {
						setIsImportOpen(true);
					}}
					isImportOpen={isImportOpen}
				/>
			</SidebarPortal>
			<main className="flex flex-1 justify-center bg-muted/40 p-4 md:p-8">
				<ReactPdfPreview cv={persistedCv} />
			</main>
			<ReplaceCvImportDialog
				open={isImportOpen}
				cvTitle={persistedCv.title}
				onOpenChange={setIsImportOpen}
				replaceCvFromImport={(payload) =>
					withCvSavePending(() => replaceCvFromImport(persistedCv.id, payload))
				}
				onReplaced={(next) => {
					hydrateFromCv(next);
					setPersistedCv(next);
				}}
			/>
		</>
	);
}

export function CvEditorPage({
	cv,
	replaceCvFromImport = replaceCvFromImportInDb,
	downloadFile = downloadTextFile,
}: CvEditorPageProps) {
	const { t } = useAppTranslation();

	if (!cv) {
		return (
			<main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 md:p-8">
				<p className="text-muted-foreground">{t("cvEditor.notFoundHint")}</p>
				<Link to="/cvs" className={buttonVariants({ variant: "outline" })}>
					{t("cvEditor.backToList")}
				</Link>
			</main>
		);
	}

	return (
		<CvSavePendingProvider>
			<CvEditorLoaded
				cv={cv}
				replaceCvFromImport={replaceCvFromImport}
				downloadFile={downloadFile}
			/>
		</CvSavePendingProvider>
	);
}
