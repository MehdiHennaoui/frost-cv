import { useForm } from "@tanstack/react-form";
import { useEffect, useRef } from "react";

import { type Cv, saveCv } from "@/entities/cv";
import { useAppTranslation } from "@/shared/i18n";
import { createAutosave } from "@/shared/lib/autosave";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
	type IdentityFields,
	identityFieldsEqual,
	identityFieldsOf,
	withIdentity,
} from "../model/identity-fields";
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
	const cvRef = useRef(cv);
	const onPersistedRef = useRef(onPersisted);
	cvRef.current = cv;
	onPersistedRef.current = onPersisted;

	const autosaveRef = useRef(
		createAutosave<IdentityFields>({
			initialSaved: identityFieldsOf(cv.content),
			isEqual: identityFieldsEqual,
			save: async (identity) => {
				const current = cvRef.current;
				const next = await saveCv({
					...current,
					content: withIdentity(current.content, identity),
				});
				onPersistedRef.current(next);
			},
		}),
	);

	useEffect(() => {
		const autosave = autosaveRef.current;
		return () => {
			void autosave.flush();
		};
	}, []);

	const initial = identityFieldsOf(cv.content);
	const draftRef = useRef(initial);
	const form = useForm({
		defaultValues: initial,
	});

	function schedule(patch: Partial<IdentityFields>) {
		draftRef.current = { ...draftRef.current, ...patch };
		autosaveRef.current.schedule(draftRef.current);
	}

	function flush() {
		void autosaveRef.current.flush();
	}

	return (
		<form
			className="space-y-3"
			onSubmit={(event) => {
				event.preventDefault();
			}}
		>
			<p className="font-medium text-sm">{t("cvEditor.section.identity")}</p>
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
		</form>
	);
}
