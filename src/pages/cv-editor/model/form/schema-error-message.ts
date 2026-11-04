export function schemaErrorMessage(
	errors: ReadonlyArray<unknown>,
): string | undefined {
	for (const error of errors) {
		if (typeof error === "string" && error.length > 0) {
			return error;
		}
		if (
			error &&
			typeof error === "object" &&
			"message" in error &&
			typeof error.message === "string" &&
			error.message.length > 0
		) {
			return error.message;
		}
	}
	return undefined;
}
