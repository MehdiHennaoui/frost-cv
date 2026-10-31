import { useForm } from "@tanstack/react-form";
import { CopyIcon, PlusIcon, XIcon } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { match, P } from "ts-pattern";

import {
	type CreateCvInput,
	type Cv,
	type CvLocale,
	createCvInputSchema,
} from "@/entities/cv";
import { APP_LOCALES, useAppTranslation } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import { Spinner } from "@/shared/ui/spinner";

export type CvTitleLocaleModalVariant = "create" | "duplicate";

type CreateCvModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultValues?: CreateCvInput;
	submitCv: (input: CreateCvInput) => Promise<Cv>;
	onCreated: (cvId: string) => void;
	variant?: CvTitleLocaleModalVariant;
};

const CREATE_DEFAULT_VALUES: CreateCvInput = {
	title: "",
	locale: "en",
};

function parseCvLocale(value: string): CvLocale {
	const locale = APP_LOCALES.find((option) => option === value);
	if (!locale) {
		return "en";
	}
	return locale;
}

function fieldErrorMessages(
	errors: unknown[],
	translate: (message: string) => string,
): Array<{ message: string }> {
	return errors.flatMap((error) =>
		// Field errors are string | { message } | unknown — otherwise drops the rest.
		match(error)
			.with(P.string.minLength(1), (message) => [
				{ message: translate(message) },
			])
			.with({ message: P.string.minLength(1) }, ({ message }) => [
				{ message: translate(message) },
			])
			.otherwise(() => []),
	);
}

export function CreateCvModal({
	open,
	onOpenChange,
	defaultValues = CREATE_DEFAULT_VALUES,
	submitCv,
	onCreated,
	variant = "create",
}: CreateCvModalProps) {
	const { t } = useAppTranslation();
	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: createCvInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const cv = await submitCv(value);
				form.reset(defaultValues);
				onOpenChange(false);
				onCreated(cv.id);
			} catch (err) {
				const fallback =
					variant === "duplicate" ? "duplicateCv.failed" : "createCv.failed";
				form.setFieldMeta("title", (meta) => ({
					...meta,
					errorMap: {
						...meta.errorMap,
						onSubmit: err instanceof Error ? err.message : fallback,
					},
				}));
			}
		},
	});

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			form.reset(defaultValues);
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

	const dialogTitle =
		variant === "duplicate" ? t("duplicateCv.title") : t("createCv.title");
	const submitLabel =
		variant === "duplicate" ? t("duplicateCv.submit") : t("createCv.submit");
	const SubmitIcon = variant === "duplicate" ? CopyIcon : PlusIcon;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{dialogTitle}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleFormSubmit}>
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
										<FieldLabel htmlFor={field.name}>
											{t("createCv.fieldTitle")}
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={handleTitleChange}
											aria-invalid={isInvalid}
											autoComplete="off"
										/>
										{isInvalid && (
											<FieldError
												errors={fieldErrorMessages(
													field.state.meta.errors,
													(message) =>
														t(
															message as
																| "createCv.titleRequired"
																| "createCv.failed"
																| "duplicateCv.failed"
																| "duplicateCv.sourceMissing",
														),
												)}
											/>
										)}
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
										<FieldLabel htmlFor={field.name}>
											{t("createCv.fieldLocale")}
										</FieldLabel>
										<NativeSelect
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={handleLocaleChange}
											aria-invalid={isInvalid}
											className="w-full"
										>
											{APP_LOCALES.map((locale) => (
												<NativeSelectOption key={locale} value={locale}>
													{t(`cvLocale.option.${locale}`)}
												</NativeSelectOption>
											))}
										</NativeSelect>
										{isInvalid && (
											<FieldError
												errors={fieldErrorMessages(
													field.state.meta.errors,
													(message) =>
														t(
															message as
																| "createCv.titleRequired"
																| "createCv.failed"
																| "duplicateCv.failed"
																| "duplicateCv.sourceMissing",
														),
												)}
											/>
										)}
									</Field>
								);
							}}
						</form.Field>
					</FieldGroup>

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<DialogFooter className="mt-4">
								<Button
									type="button"
									variant="outline"
									disabled={isSubmitting}
									onClick={handleCancel}
								>
									<XIcon data-icon="inline-start" />
									{t("createCv.cancel")}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? (
										<Spinner data-icon="inline-start" />
									) : (
										<SubmitIcon data-icon="inline-start" />
									)}
									{submitLabel}
								</Button>
							</DialogFooter>
						)}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	);
}
