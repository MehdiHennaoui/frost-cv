import {
	type CvContent,
	customSectionIdFromKey,
	isCustomSectionKey,
	sectionOrderOf,
} from "@/entities/cv";
import { customSectionOf } from "./custom-section-fields";
import { educationOf } from "./education-fields";
import { entryScanLabel } from "./entry-scan-label";
import { experiencesOf } from "./experience-fields";
import { languagesOf } from "./language-fields";

export type GoToTarget = {
	id: string;
	label: string;
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
				groupId: "languages",
				groupLabel,
			});
			languagesOf(content).forEach((entry, index) => {
				targets.push({
					id: entry.id,
					label: entryScanLabel(index + 1, [entry.language], groupLabel),
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
				groupId: id,
				groupLabel,
			});
		}
	}

	return targets;
}
