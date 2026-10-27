import type { CvContent } from "@/entities/cv";

export type IdentityFields = {
	firstName: string;
	lastName: string;
	jobTitle: string;
	email: string;
	phone: string;
	postalCode: string;
	linkedin: string;
	github: string;
	website: string;
	description: string;
};

const EMPTY: IdentityFields = {
	firstName: "",
	lastName: "",
	jobTitle: "",
	email: "",
	phone: "",
	postalCode: "",
	linkedin: "",
	github: "",
	website: "",
	description: "",
};

function readString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

/** Reads persisted Identity fields from CV content. */
export function identityFieldsOf(content: CvContent): IdentityFields {
	const raw = content.identity;
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return EMPTY;
	}
	const identity = raw as Record<string, unknown>;
	return {
		firstName: readString(identity.firstName),
		lastName: readString(identity.lastName),
		jobTitle: readString(identity.jobTitle),
		email: readString(identity.email),
		phone: readString(identity.phone),
		postalCode: readString(identity.postalCode),
		linkedin: readString(identity.linkedin),
		github: readString(identity.github),
		website: readString(identity.website),
		description: readString(identity.description),
	};
}

/** Merges Identity fields into CV content without dropping other sections. */
export function withIdentity(
	content: CvContent,
	identity: IdentityFields,
): CvContent {
	return {
		...content,
		identity: { ...identity },
	};
}

export function identityFieldsEqual(
	a: IdentityFields,
	b: IdentityFields,
): boolean {
	return (
		a.firstName === b.firstName &&
		a.lastName === b.lastName &&
		a.jobTitle === b.jobTitle &&
		a.email === b.email &&
		a.phone === b.phone &&
		a.postalCode === b.postalCode &&
		a.linkedin === b.linkedin &&
		a.github === b.github &&
		a.website === b.website &&
		a.description === b.description
	);
}
