import { useAppTranslation } from "@/shared/i18n";
import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { useEditorForm } from "../../model/form/editor-form-context";
import { schemaErrorMessage } from "../../model/form/schema-error-message";
import { MonthInput } from "./month-input";
import { RichTextEditor } from "./rich-text-editor";

type EditorBoundFieldProps = {
	name: string;
	id: string;
	label: string;
	control?: "text" | "month" | "richtext";
};

export function EditorBoundField({
	name,
	id,
	label,
	control = "text",
}: EditorBoundFieldProps) {
	const { form, schedule } = useEditorForm();
	const { t } = useAppTranslation();

	return (
		<form.Field name={name as "identity.firstName"}>
			{(field) => {
				const message = schemaErrorMessage(field.state.meta.errors);
				const invalid = message !== undefined;
				const value = field.state.value;

				function commit(next: string) {
					field.handleChange(next);
					schedule();
				}

				return (
					<Field data-invalid={invalid || undefined}>
						<FieldLabel htmlFor={id}>{label}</FieldLabel>
						{control === "month" ? (
							<MonthInput
								id={id}
								value={value}
								aria-invalid={invalid || undefined}
								onBlur={field.handleBlur}
								onChange={(event) => commit(event.target.value)}
							/>
						) : control === "richtext" ? (
							<RichTextEditor
								id={id}
								value={value}
								aria-invalid={invalid || undefined}
								onBlur={field.handleBlur}
								onChange={commit}
							/>
						) : (
							<Input
								id={id}
								name={field.name}
								variant="surface"
								value={value}
								aria-invalid={invalid || undefined}
								onBlur={field.handleBlur}
								onChange={(event) => commit(event.target.value)}
							/>
						)}
						{message && (
							<FieldError
								errors={[
									{
										message: t(
											message as
												| "cvEditor.month.invalid"
												| "cvEditor.experiences.errors.endBeforeStart"
												| "cvEditor.education.errors.endBeforeStart",
										),
									},
								]}
							/>
						)}
					</Field>
				);
			}}
		</form.Field>
	);
}
