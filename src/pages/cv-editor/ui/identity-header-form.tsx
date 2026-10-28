import { useForm } from "@tanstack/react-form";
import { UserIcon } from "lucide-react";
import { useRef } from "react";

import type { Cv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
	type IdentityFields,
	identityFieldsEqual,
	identityFieldsOf,
	withIdentity,
} from "../model/identity-fields";
import { useCvAutosave } from "../model/use-cv-autosave";
import { RichTextEditor } from "./rich-text-editor";

type IdentityHeaderFormProps = {
	cv: Cv;
	onPersisted: (cv: Cv) => void;
};

const TEXT_FIELDS = [
	"firstName",
	"lastName",
	"jobTitle",
	"email",
	"phone",
	"postalCode",
	"linkedin",
	"github",
	"website",
] as const satisfies ReadonlyArray<keyof IdentityFields>;

export function IdentityHeaderForm({
	cv,
	onPersisted,
}: IdentityHeaderFormProps) {
	const { t } = useAppTranslation();
	const initial = identityFieldsOf(cv.content);
	const draftRef = useRef(initial);
	const autosave = useCvAutosave({
		cv,
		onPersisted,
		initialSaved: initial,
		isEqual: identityFieldsEqual,
		apply: withIdentity,
	});
	const form = useForm({
		defaultValues: initial,
	});

	function schedule(patch: Partial<IdentityFields>) {
		draftRef.current = { ...draftRef.current, ...patch };
		autosave.schedule(draftRef.current);
	}

	function flush() {
		autosave.flush();
	}

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
			}}
		>
			<Card size="sm">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserIcon aria-hidden className="size-4 shrink-0" />
						{t("cvEditor.section.identity")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-3">
						{TEXT_FIELDS.map((name) => (
							<form.Field key={name} name={name}>
								{(field) => (
									<Field>
										<FieldLabel htmlFor={`identity-${name}`}>
											{t(`cvEditor.identity.field.${name}`)}
										</FieldLabel>
										<Input
											id={`identity-${name}`}
											name={field.name}
											value={field.state.value}
											onBlur={() => {
												field.handleBlur();
												flush();
											}}
											onChange={(event) => {
												const value = event.target.value;
												field.handleChange(value);
												schedule({ [name]: value });
											}}
										/>
									</Field>
								)}
							</form.Field>
						))}

						<form.Field name="description">
							{(field) => (
								<Field>
									<FieldLabel htmlFor="identity-description">
										{t("cvEditor.identity.field.description")}
									</FieldLabel>
									<RichTextEditor
										id="identity-description"
										value={field.state.value}
										onBlur={() => {
											field.handleBlur();
											flush();
										}}
										onChange={(html) => {
											field.handleChange(html);
											schedule({ description: html });
										}}
									/>
								</Field>
							)}
						</form.Field>
					</FieldGroup>
				</CardContent>
			</Card>
		</form>
	);
}
