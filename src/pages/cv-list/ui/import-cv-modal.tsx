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

type ImportCvModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	createCvFromImport: (payload: CvImportPayload) => Promise<Cv>;
	onCreated: (cvId: string) => void | Promise<void>;
};

export function ImportCvModal({
	open,
	onOpenChange,
	createCvFromImport,
	onCreated,
}: ImportCvModalProps) {
	const { t } = useAppTranslation();
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [isImporting, setIsImporting] = useState(false);
	const [error, setError] = useState<ImportError | null>(null);

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen && isImporting) {
			return;
		}
		if (!nextOpen) {
			setError(null);
			if (inputRef.current) {
				inputRef.current.value = "";
			}
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

		setIsImporting(true);
		setError(null);
		try {
			const text = await file.text();
			const parsed = parseCvExportDocument(text);
			if (!parsed.ok) {
				setError(parsed.error);
				return;
			}
			const cv = await createCvFromImport(parsed.value);
			onOpenChange(false);
			await onCreated(cv.id);
		} catch {
			setError("cvExport.importFailed");
		} finally {
			setIsImporting(false);
			if (inputRef.current) {
				inputRef.current.value = "";
			}
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent showCloseButton={!isImporting}>
				<DialogHeader>
					<DialogTitle>{t("cvExport.importTitle")}</DialogTitle>
					<DialogDescription>
						{t("cvExport.importDescription")}
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
						className={cn(buttonVariants(), {
							"pointer-events-none opacity-50": isImporting,
						})}
					>
						{isImporting ? (
							<Spinner data-icon="inline-start" />
						) : (
							<FileUpIcon data-icon="inline-start" />
						)}
						{t("cvExport.chooseFile")}
					</label>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
