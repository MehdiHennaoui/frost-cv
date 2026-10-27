# Testing debounced autosave (editor forms)

Pattern used by the CV editor header (ticket 06) and expected for later section forms.

## What to mock

- Mock the persist function (`saveCv` / repository), not Dexie, when testing debounce/flush timing.
- Mock TipTap (`RichTextEditor`) with a plain `<textarea>` so jsdom does not hang on editor boot.

## Fake timers

- Call `vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] })` **after** any real async setup (seed DB, render).
- Leave Promises / microtasks real so mocked `save` can resolve.
- Avoid `waitFor` under full fake timers (polling never advances). Prefer `advanceTimersByTimeAsync` then assert, or wrap flush in `act`.

## Assertions

- Debounce: change → advance 999ms → save not called; advance 1ms → save called once with latest value.
- Blur flush: change → `act(() => blur)` → save called without waiting the full debounce.
