import { type CvContent, type SectionKey, sectionOrderOf } from "@/entities/cv";
import { moveEntryTo } from "./entry-list";

export function moveSection(
	content: CvContent,
	key: SectionKey,
	toIndex: number,
): CvContent {
	const movable = sectionOrderOf(content).filter((item) => item !== "identity");
	const items = movable.map((id) => ({ id }));
	const next = moveEntryTo(items, key, toIndex);
	if (next === items) {
		return content;
	}

	return {
		...content,
		sectionOrder: ["identity", ...next.map((item) => item.id)],
	};
}
