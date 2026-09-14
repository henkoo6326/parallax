# PARALLAX interaction prototype implementation plan

**Goal:** Deliver a Korean foldable field-work application prototype with persistent case state, handoff review, and independent multitasking panels.

**Architecture:** Dependency-free HTML/CSS/JavaScript. A pure state module owns workflow transitions; the UI renders two independently selected work panels and saves case state locally. Generated map and illustrative camera assets live in assets/. Existing research and original HTML are retained.

**Design:** Apply the user's accepted two-mode architecture and latest references: near-black petrol canvas, emerald selected objects, rounded layered sheets, restrained fine-line icons. Folded: one task with bottom navigation. Unfolded: persistent map or selected primary tool plus independently selectable secondary tool. No sequential next/previous page controls.

**Scope:** A functional local design prototype, with simulated camera, AI draft, message delivery and AR hardware. No external communications or production backend. Label simulation in the surrounding preview and media state.

## Implementation

- [x] Create tests/state.test.mjs for fold/navigation persistence, draft preservation, offline queue/retry, handoff acceptance gating and task completion.
- [x] Implement app/state.mjs with createState and reduce; run `node --test tests/state.test.mjs`.
- [x] Create index.html, app/styles.css, app/main.mjs with folded/unfolded shells, independently navigable panels, task checklist, map pins/floors, video details and capture, record log and editable report, messages and handoff, device status and voice input sheet.
- [x] Generate fictional isometric map and camera still with built-in image generation; copy selected originals into assets and record prompts in docs/design-brief.md.
- [x] Verify using module syntax checks, state tests, and browser interaction with the newly authored app. Check two display sizes, independent panes, persistent report, queue retry, handoff and keyboard navigation. Preserve user-facing preview.

## Acceptance

1. Folding and changing tools never clear entered text or selected case.
2. A map pin opens linked media in a second pane on the unfolded layout.
3. A report can be edited, saved, queued offline and retried online without duplicates.
4. Handoff review and acceptance are separate, with explicit acceptance and continuation into field mode.
5. Generated images are used in real app views; map and video are clearly illustrative.
