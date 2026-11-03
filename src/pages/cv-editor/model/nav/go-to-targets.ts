import {
	type CvContent,
	customSectionIdFromKey,
	isCustomSectionKey,
	sectionOrderOf,
} from "@/entities/cv";
import { entryScanLabel } from "../entries/entry-scan-label";
import { customSectionOf } from "../sections/custom-section-fields";
import { educationOf } from "../sections/education-fields";
import { experiencesOf } from "../sections/experience-fields";
import { languagesOf } from "../sections/language-fields";

export type GoToTarget = {
	id: string;
	label: string;
	kind: "section" | "entry";
	groupId: string;
	groupLabel: string;
};

export type GoToSectionLabels = {
	identity: string;
	experiences: string;
	education: string;
	languages: string;
	untitledCustom: string;
};

/** shortcut: labels from persisted content, not live drafts — upgrade if palette must match mid-edit headers */
export function buildGoToTargets(
	content: CvContent,
	labels: GoToSectionLabels,
): GoToTarget[] {
	const targets: GoToTarget[] = [];

	for (const key of sectionOrderOf(content)) {
		if (key === "identity") {
			const label = labels.identity;
			targets.push({
				id: "identity",
				label,
				kind: "section",
				groupId: "identity",
				groupLabel: label,
			});
			continue;
		}

		if (key === "experiences") {
			const groupLabel = labels.experiences;
			targets.push({
				id: "experiences",
				label: groupLabel,
				kind: "section",
				groupId: "experiences",
				groupLabel,
			});
			experiencesOf(content).forEach((entry, index) => {
				targets.push({
					id: entry.id,
					label: entryScanLabel(
						index + 1,
						[entry.jobTitle, entry.company],
						groupLabel,
					),
					kind: "entry",
					groupId: "experiences",
					groupLabel,
				});
			});
			continue;
		}

		if (key === "education") {
			const groupLabel = labels.education;
			targets.push({
				id: "education",
				label: groupLabel,
				kind: "section",
				groupId: "education",
				groupLabel,
			});
			educationOf(content).forEach((entry, index) => {
				targets.push({
					id: entry.id,
					label: entryScanLabel(
						index + 1,
						[entry.degree, entry.school],
						groupLabel,
					),
					kind: "entry",
					groupId: "education",
					groupLabel,
				});
			});
			continue;
		}

		if (key === "languages") {
			const groupLabel = labels.languages;
			targets.push({
				id: "languages",
				label: groupLabel,
				kind: "section",
				groupId: "languages",
				groupLabel,
			});
			languagesOf(content).forEach((entry, index) => {
				targets.push({
					id: entry.id,
					label: entryScanLabel(index + 1, [entry.language], groupLabel),
					kind: "entry",
					groupId: "languages",
					groupLabel,
				});
			});
			continue;
		}

		if (isCustomSectionKey(key)) {
			const id = customSectionIdFromKey(key);
			const section = customSectionOf(content, id);
			const groupLabel = section?.title.trim() || labels.untitledCustom;
			targets.push({
				id,
				label: groupLabel,
				kind: "section",
				groupId: id,
				groupLabel,
			});
		}
	}

	return targets;
}
