import { Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
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
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent showCloseButton={!isDeleting}>
				<DialogHeader>
					<DialogTitle>Delete CV</DialogTitle>
					<DialogDescription>
						Delete “{cvTitle}”? This cannot be undone.
					</DialogDescription>
				</DialogHeader>
				{error && (
					<p className="text-destructive text-sm" role="alert">
						{error}
					</p>
				)}
				<DialogFooter>
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
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
