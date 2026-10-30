import { FileUpIcon, XIcon } from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";

import {
	type Cv,
	type CvImportPayload,
	parseCvExportDocument,
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

type ImportError =
	| "cvExport.invalidJson"
	| "cvExport.unsupportedVersion"
	| "cvExport.invalidSchema"
	| "cvExport.importFailed";

type ReplaceCvImportDialogProps = {
	open: boolean;
	cvTitle: string;
	onOpenChange: (open: boolean) => void;
	replaceCvFromImport: (payload: CvImportPayload) => Promise<Cv>;
	onReplaced: (cv: Cv) => void | Promise<void>;
};

export function ReplaceCvImportDialog({
	open,
	cvTitle,
	onOpenChange,
	replaceCvFromImport,
	onReplaced,
}: ReplaceCvImportDialogProps) {
	const { t } = useAppTranslation();
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [pending, setPending] = useState<CvImportPayload | null>(null);
	const [isImporting, setIsImporting] = useState(false);
	const [error, setError] = useState<ImportError | null>(null);

	function resetFileInput() {
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen && isImporting) {
			return;
		}
		if (!nextOpen) {
			setError(null);
			setPending(null);
			resetFileInput();
		}
		onOpenChange(nextOpen);
	}

	function handleCancel() {
		handleOpenChange(false);
	}

	async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		setError(null);
		try {
			const text = await file.text();
			const parsed = parseCvExportDocument(text);
			if (!parsed.ok) {
				setError(parsed.error);
				setPending(null);
				return;
			}
			setPending(parsed.value);
		} catch {
			setError("cvExport.importFailed");
			setPending(null);
		} finally {
			resetFileInput();
		}
	}

	async function handleConfirm() {
		if (!pending) {
			return;
		}
		setIsImporting(true);
		setError(null);
		try {
			const cv = await replaceCvFromImport(pending);
			onOpenChange(false);
			await onReplaced(cv);
		} catch {
			setError("cvExport.importFailed");
		} finally {
			setIsImporting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent showCloseButton={!isImporting}>
				<DialogHeader>
					<DialogTitle>{t("cvExport.replaceTitle")}</DialogTitle>
					<DialogDescription>
						{t("cvExport.replaceDescription", { title: cvTitle })}
					</DialogDescription>
				</DialogHeader>
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
				{pending && (
					<p className="text-muted-foreground text-sm">
						{t("cvExport.replaceReady", { title: pending.title })}
					</p>
				)}
				{error && (
					<p className="text-destructive text-sm" role="alert">
						{t(error)}
					</p>
				)}
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						disabled={isImporting}
						onClick={handleCancel}
					>
						<XIcon data-icon="inline-start" />
						{t("cvExport.cancel")}
					</Button>
					<label
						htmlFor={inputId}
						aria-disabled={isImporting || undefined}
						className={cn(buttonVariants({ variant: "outline" }), {
							"pointer-events-none opacity-50": isImporting,
						})}
					>
						<FileUpIcon data-icon="inline-start" />
						{t("cvExport.chooseFile")}
					</label>
					<Button
						type="button"
						disabled={isImporting || !pending}
						onClick={() => {
							void handleConfirm();
						}}
					>
						{isImporting && <Spinner data-icon="inline-start" />}
						{t("cvExport.replaceConfirm")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
