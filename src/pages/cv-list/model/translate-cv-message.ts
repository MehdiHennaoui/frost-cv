import type { TFunction } from "i18next";

const knownMessages = {
	"Title is required": "createCv.titleRequired",
	"Could not create CV": "createCv.failed",
	"Could not delete CV": "deleteCv.failed",
} as const;

type KnownMessage = keyof typeof knownMessages;

function isKnownMessage(message: string): message is KnownMessage {
	return Object.hasOwn(knownMessages, message);
}

export function translateCvMessage(message: string, t: TFunction): string {
	if (!isKnownMessage(message)) {
		return message;
	}
	return t(knownMessages[message]);
}
