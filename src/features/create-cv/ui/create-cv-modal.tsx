import { Dialog } from "@base-ui/react/dialog";
import { useForm } from "@tanstack/react-form";
import { PlusIcon, XIcon } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { match, P } from "ts-pattern";

import {
	type CreateCvInput,
	type Cv,
	type CvLocale,
	createCvInputSchema,
} from "@/entities/cv/model/cv";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import { Spinner } from "@/shared/ui/spinner";

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

const DEFAULT_VALUES: CreateCvInput = {
	title: "",
	locale: "en",
};

function parseCvLocale(value: string): CvLocale {
	const locale = LOCALES.find((option) => option.value === value);
	if (!locale) {
		return "en";
	}
	return locale.value;
}

function fieldErrorMessages(errors: unknown[]): Array<{ message: string }> {
	return errors.flatMap((error) =>
		// Field errors are string | { message } | unknown — otherwise drops the rest.
		match(error)
			.with(P.string.minLength(1), (message) => [{ message }])
			.with({ message: P.string.minLength(1) }, ({ message }) => [{ message }])
			.otherwise(() => []),
	);
}

export function CreateCvModal({
	open,
	onOpenChange,
	createCv,
	onCreated,
}: CreateCvModalProps) {
	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: {
			onSubmit: createCvInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const cv = await createCv(value);
				form.reset();
				onOpenChange(false);
				onCreated(cv.id);
			} catch (err) {
				form.setFieldMeta("title", (meta) => ({
					...meta,
					errorMap: {
						...meta.errorMap,
						onSubmit:
							err instanceof Error ? err.message : "Could not create CV",
					},
				}));
			}
		},
	});

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			form.reset();
		}
		onOpenChange(nextOpen);
	}

	async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		event.stopPropagation();
		await form.handleSubmit();
	}

	function handleCancel() {
		handleOpenChange(false);
	}

	return (
		<Dialog.Root open={open} onOpenChange={handleOpenChange}>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
				<Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg">
					<Dialog.Title className="font-semibold text-lg">
						Create new CV
					</Dialog.Title>
					<form className="mt-4" onSubmit={handleFormSubmit}>
						<FieldGroup className="gap-4">
							<form.Field name="title">
								{(field) => {
									const isInvalid = field.state.meta.errors.length > 0;

									function handleTitleChange(
										event: ChangeEvent<HTMLInputElement>,
									) {
										field.handleChange(event.target.value);
									}

									return (
										<Field data-invalid={isInvalid || undefined}>
											<FieldLabel htmlFor={field.name}>Title</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={handleTitleChange}
												aria-invalid={isInvalid}
												autoComplete="off"
											/>
											{isInvalid ? (
												<FieldError
													errors={fieldErrorMessages(field.state.meta.errors)}
												/>
											) : null}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="locale">
								{(field) => {
									const isInvalid = field.state.meta.errors.length > 0;

									function handleLocaleChange(
										event: ChangeEvent<HTMLSelectElement>,
									) {
										field.handleChange(parseCvLocale(event.target.value));
									}

									return (
										<Field data-invalid={isInvalid || undefined}>
											<FieldLabel htmlFor={field.name}>CV locale</FieldLabel>
											<NativeSelect
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={handleLocaleChange}
												aria-invalid={isInvalid}
												className="w-full"
											>
												{LOCALES.map((option) => (
													<NativeSelectOption
														key={option.value}
														value={option.value}
													>
														{option.label}
													</NativeSelectOption>
												))}
											</NativeSelect>
											{isInvalid ? (
												<FieldError
													errors={fieldErrorMessages(field.state.meta.errors)}
												/>
											) : null}
										</Field>
									);
								}}
							</form.Field>
						</FieldGroup>

						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<div className="mt-4 flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										disabled={isSubmitting}
										onClick={handleCancel}
									>
										<XIcon data-icon="inline-start" />
										Cancel
									</Button>
									<Button type="submit" disabled={isSubmitting}>
										{isSubmitting ? (
											<Spinner data-icon="inline-start" />
										) : (
											<PlusIcon data-icon="inline-start" />
										)}
										Create CV
									</Button>
								</div>
							)}
						</form.Subscribe>
					</form>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
