import { Dialog } from "@base-ui/react/dialog";
import { type FormEvent, useState } from "react";

import type { CreateCvInput, Cv, CvLocale } from "@/entities/cv/model/cv";
import { Button } from "@/shared/ui/button";

type CreateCvModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	createCv: (input: CreateCvInput) => Promise<Cv>;
	onCreated: (cvId: string) => void;
};

const LOCALES: { value: CvLocale; label: string }[] = [
	{ value: "en", label: "English" },
	{ value: "fr-CA", label: "French (Canada)" },
];

export function CreateCvModal({
	open,
	onOpenChange,
	createCv,
	onCreated,
}: CreateCvModalProps) {
	const [title, setTitle] = useState("");
	const [locale, setLocale] = useState<CvLocale>("en");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function resetForm() {
		setTitle("");
		setLocale("en");
		setError(null);
		setIsSubmitting(false);
	}

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			resetForm();
		}
		onOpenChange(nextOpen);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmed = title.trim();
		if (!trimmed) {
			setError("Title is required");
			return;
		}

		setIsSubmitting(true);
		setError(null);
		try {
			const cv = await createCv({ title: trimmed, locale });
			resetForm();
			onOpenChange(false);
			onCreated(cv.id);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create CV");
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog.Root open={open} onOpenChange={handleOpenChange}>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
				<Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg">
					<Dialog.Title className="font-semibold text-lg">
						Create CV
					</Dialog.Title>
					<form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-1.5">
							<label className="font-medium text-sm" htmlFor="cv-title">
								Title
							</label>
							<input
								id="cv-title"
								name="title"
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
								autoComplete="off"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="font-medium text-sm" htmlFor="cv-locale">
								CV locale
							</label>
							<select
								id="cv-locale"
								name="locale"
								value={locale}
								onChange={(event) => setLocale(event.target.value as CvLocale)}
								className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
							>
								{LOCALES.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
						{error ? (
							<p className="text-destructive text-sm" role="alert">
								{error}
							</p>
						) : null}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								Create
							</Button>
						</div>
					</form>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
