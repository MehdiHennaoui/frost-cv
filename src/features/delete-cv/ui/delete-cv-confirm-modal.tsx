import { Dialog } from "@base-ui/react/dialog";
import { Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type DeleteCvConfirmModalProps = {
	open: boolean;
	cvId: string;
	cvTitle: string;
	onOpenChange: (open: boolean) => void;
	deleteCv: (id: string) => Promise<void>;
	onDeleted: () => void | Promise<void>;
};

export function DeleteCvConfirmModal({
	open,
	cvId,
	cvTitle,
	onOpenChange,
	deleteCv,
	onDeleted,
}: DeleteCvConfirmModalProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen && isDeleting) {
			return;
		}
		if (!nextOpen) {
			setError(null);
		}
		onOpenChange(nextOpen);
	}

	function handleCancel() {
		handleOpenChange(false);
	}

	async function handleConfirm() {
		setIsDeleting(true);
		setError(null);
		try {
			await deleteCv(cvId);
			onOpenChange(false);
			await onDeleted();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not delete CV");
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<Dialog.Root open={open} onOpenChange={handleOpenChange}>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
				<Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg">
					<Dialog.Title className="font-semibold text-lg">
						Delete CV
					</Dialog.Title>
					<Dialog.Description className="mt-2 text-muted-foreground text-sm">
						Delete “{cvTitle}”? This cannot be undone.
					</Dialog.Description>
					{error ? (
						<p className="mt-3 text-destructive text-sm" role="alert">
							{error}
						</p>
					) : null}
					<div className="mt-4 flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							disabled={isDeleting}
							onClick={handleCancel}
						>
							<XIcon data-icon="inline-start" />
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={isDeleting}
							onClick={handleConfirm}
						>
							{isDeleting ? (
								<Spinner data-icon="inline-start" />
							) : (
								<Trash2Icon data-icon="inline-start" />
							)}
							Delete
						</Button>
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
