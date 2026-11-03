import { Trash2Icon, XIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

type CvDeleteConfirmDialogProps = {
	title: string;
	description: string;
	cancelLabel: string;
	confirmLabel: string;
	onCancel: () => void;
	onConfirm: () => void;
};

export function CvDeleteConfirmDialog({
	title,
	description,
	cancelLabel,
	confirmLabel,
	onCancel,
	onConfirm,
}: CvDeleteConfirmDialogProps) {
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onCancel();
		}
	};

	return (
		<Dialog open onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onCancel}>
						<XIcon data-icon="inline-start" />
						{cancelLabel}
					</Button>
					<Button type="button" variant="destructive" onClick={onConfirm}>
						<Trash2Icon data-icon="inline-start" />
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
