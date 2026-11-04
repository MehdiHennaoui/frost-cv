import { UserIcon } from "lucide-react";

import { useAppTranslation } from "@/shared/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FieldGroup } from "@/shared/ui/field";
import { EditorBoundField } from "../editors/editor-bound-field";

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
] as const;

export function IdentityHeaderForm() {
	const { t } = useAppTranslation();

	return (
		<Card id="identity" size="sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<UserIcon aria-hidden className="size-4 shrink-0" />
					{t("cvEditor.section.identity")}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<FieldGroup className="gap-3">
					{TEXT_FIELDS.map((name) => (
						<EditorBoundField
							key={name}
							name={`identity.${name}`}
							id={`identity-${name}`}
							label={t(`cvEditor.identity.field.${name}`)}
						/>
					))}
					<EditorBoundField
						name="identity.description"
						id="identity-description"
						label={t("cvEditor.identity.field.description")}
						control="richtext"
					/>
				</FieldGroup>
			</CardContent>
		</Card>
	);
}
