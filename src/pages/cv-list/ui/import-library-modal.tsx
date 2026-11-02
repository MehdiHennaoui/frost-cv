import { FileUpIcon, XIcon } from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";

import {
	type Cv,
	type CvImportPayload,
	type LibraryImportMode,
	parseLibraryExportDocument,
} from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Button, buttonVariants } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Spinner } from "@/shared/ui/spinner";
import { toast } from "@/shared/ui/toast";

type ImportLibraryModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	importLibraryCvs: (
		payloads: CvImportPayload[],
		mode: LibraryImportMode,
	) => Promise<Cv[]>;
	onImported: () => void | Promise<void>;
};

type Step = "mode" | "confirm-replace" | "pick-file";

export function ImportLibraryModal({
	open,
	onOpenChange,
	importLibraryCvs,
	onImported,
}: ImportLibraryModalProps) {
	const { t } = useAppTranslation();
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [step, setStep] = useState<Step>("mode");
	const [mode, setMode] = useState<LibraryImportMode | null>(null);
	const [isImporting, setIsImporting] = useState(false);

	function resetState() {
		setStep("mode");
		setMode(null);
		setIsImporting(false);
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen && isImporting) {
			return;
		}
		if (!nextOpen) {
			resetState();
		}
		onOpenChange(nextOpen);
	}

	function handleCancel() {
		handleOpenChange(false);
	}

	function handleChooseAdd() {
		setMode("add");
		setStep("pick-file");
	}

	function handleChooseReplace() {
		setMode("replace");
		setStep("confirm-replace");
	}

	function handleConfirmReplace() {
		setStep("pick-file");
	}

	async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file || !mode) {
			return;
		}

		setIsImporting(true);
		try {
			const text = await file.text();
			const parsed = parseLibraryExportDocument(text);
			if (!parsed.ok) {
				if (parsed.error === "libraryExport.invalidSchema") {
					toast.add({
						type: "error",
						title: t(parsed.error, { cvLabel: parsed.cvLabel }),
					});
				} else {
					toast.add({ type: "error", title: t(parsed.error) });
				}
				return;
			}
			await importLibraryCvs(parsed.value, mode);
			toast.add({ type: "success", title: t("libraryImport.importSuccess") });
			onOpenChange(false);
			resetState();
			await onImported();
		} catch {
			toast.add({ type: "error", title: t("libraryImport.importFailed") });
		} finally {
			setIsImporting(false);
			if (inputRef.current) {
				inputRef.current.value = "";
			}
		}
	}

	let title = t("libraryImport.title");
	let description = t("libraryImport.description");
	if (step === "confirm-replace") {
		title = t("libraryImport.confirmReplaceTitle");
		description = t("libraryImport.confirmReplaceDescription");
	} else if (step === "pick-file") {
		description = t("libraryImport.chooseFileDescription");
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent showCloseButton={!isImporting}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				{step === "pick-file" && (
					<input
						ref={inputRef}
						id={inputId}
						type="file"
						accept="application/json,.json"
						className="sr-only"
						disabled={isImporting}
						onChange={(event) => {
							void handleFileChange(event);
						}}
					/>
				)}

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						disabled={isImporting}
						onClick={handleCancel}
					>
						<XIcon data-icon="inline-start" />
						{t("libraryImport.cancel")}
					</Button>

					{step === "mode" && (
						<>
							<Button type="button" variant="outline" onClick={handleChooseAdd}>
								{t("libraryImport.add")}
							</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={handleChooseReplace}
							>
								{t("libraryImport.replace")}
							</Button>
						</>
					)}

					{step === "confirm-replace" && (
						<Button
							type="button"
							variant="destructive"
							onClick={handleConfirmReplace}
						>
							{t("libraryImport.confirmReplace")}
						</Button>
					)}

					{step === "pick-file" && (
						<label
							htmlFor={inputId}
							aria-disabled={isImporting || undefined}
							className={cn(buttonVariants(), {
								"pointer-events-none opacity-50": isImporting,
							})}
						>
							{isImporting ? (
								<Spinner data-icon="inline-start" />
							) : (
								<FileUpIcon data-icon="inline-start" />
							)}
							{t("libraryImport.chooseFile")}
						</label>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
