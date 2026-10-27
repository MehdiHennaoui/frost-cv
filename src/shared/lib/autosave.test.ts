import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAutosave } from "./autosave";

describe("createAutosave", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("saves the latest value after 1s of idle", async () => {
		const save = vi.fn().mockResolvedValue(undefined);
		const autosave = createAutosave({ save });

		autosave.schedule("a");
		autosave.schedule("ab");
		expect(save).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(999);
		expect(save).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);
		expect(save).toHaveBeenCalledTimes(1);
		expect(save).toHaveBeenCalledWith("ab");
	});

	it("flush saves immediately and cancels the pending debounce", async () => {
		const save = vi.fn().mockResolvedValue(undefined);
		const autosave = createAutosave({ save });

		autosave.schedule("draft");
		await autosave.flush();

		expect(save).toHaveBeenCalledTimes(1);
		expect(save).toHaveBeenCalledWith("draft");

		await vi.advanceTimersByTimeAsync(1000);
		expect(save).toHaveBeenCalledTimes(1);
	});

	it("skips save when the value equals the last saved value", async () => {
		const save = vi.fn().mockResolvedValue(undefined);
		const autosave = createAutosave({ save });

		autosave.schedule("same");
		await vi.advanceTimersByTimeAsync(1000);
		autosave.schedule("same");
		await autosave.flush();

		expect(save).toHaveBeenCalledTimes(1);
	});
});
