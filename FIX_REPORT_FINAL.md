# THẦY GIA HUY — FINAL SOURCE FIX REPORT

## Locked zones preserved

The following files are treated as immutable for this repair pass:

- admin-panel.html
- admin-login.html
- login.html
- register.html
- teacher-login.html
- teacher.html
- student.html
- guest-login.html

SHA-256 baselines are stored in `LOCKED_FILES_SHA256.json` and all locked hashes match after the repair.

## Fixed issues

### 1. Homepage expansion
The homepage upgrade scripts are now explicitly loaded on the editable homepage surface. The expansion remains additive and does not replace the locked auth/panel pages.

### 2. CoreUI Icons
CoreUI Icons are vendored locally under `assets/vendor/coreui/`. New/modern pages use the local CoreUI icon font. Legacy auth/panel icon code remains untouched.

### 3. CoreUI compatibility
Added an unlocked-surface compatibility alias for `cil-flask`, mapping to the real CoreUI beaker glyph so education data does not render a missing glyph.

### 4. Shared content adapter
Added `js/gh-content-adapter.js` so assignments, quizzes, flashcards, profile and quiz attempts can use existing `edu.js`/browser storage data where available instead of relying only on static fallback data.

### 5. Flashcard study flow
Flashcards now have a real study mode with card flipping, previous/next, known/unknown actions, progress and completion summary. New deck creation now creates a real first card instead of an unusable placeholder.

### 6. Quiz flow
Quiz pages now have a real question player, answer selection, timer support, submission, score calculation, history and answer review. Timer cleanup is also handled when the modal closes.

### 7. Video flow
Video pages use runtime-uploaded videos from IndexedDB when available and open them in a real modal player. Object URLs are cleaned up on modal close.

### 8. Game Center
Game Center uses the actual canvas-based game engine rather than a placeholder alert. Game filters now work through the shared search/filter handler. Game engine loops and event listeners are cleaned up when the modal closes.

### 9. Assignment CTA
The previous fake “record completion” action was removed from the assignment modal. The action now opens the real assignment route and clearly distinguishes completed vs not-yet-completed states.

### 10. Q&A
Q&A has question creation, persistent local question storage, thread details, replies, reply persistence and visible reply states.

### 11. Notifications
Notification read state and “mark all read” are persisted on the device.

### 12. Statistics
Statistics now use tracked interaction events and runtime IndexedDB file data. The activity bars were changed from fabricated fixed formulas to actual percentage shares of recorded activity. Quiz average is calculated from stored attempts.

### 13. Profile
Profile editing persists through the existing local profile state and stays on the profile surface instead of routing the edit action to settings.

### 14. Settings / theme
Unlocked platform pages have a working theme toggle and dark-theme styles. Modal, form, quiz, flashcard and action states also receive dark-mode styling.

### 15. Legacy editable pages
The modern visual overlay remains scoped to non-locked legacy pages. It does not load on locked auth/panel pages. The unlocked surface helper repairs the old theme button rendering problem without touching the shared auth/panel implementation.

### 16. Catalog filters
Catalog filter chips are now actual buttons and the platform catalog bridge has real sorting hooks.

### 17. Search/filter empty states
The shared search/filter handler now keeps text search and category chips synchronized and recalculates empty states correctly.

### 18. Modal reliability
Generic modal close behavior now supports Escape, focus targeting and cleanup callbacks. This prevents resource leaks from active timers, video object URLs and running game loops.



## Validation performed

- 203/203 unlocked-surface static checks passed.
- All JavaScript files passed `node --check`.
- Website pages returned HTTP 200 in a local static HTTP smoke test.
- Locked auth/panel hashes matched their recorded SHA-256 baselines.
- No plain `href="#"` remained in unlocked HTML pages checked.
- No direct Lucide references remained in unlocked pages checked.
- CoreUI icon references used by editable pages were verified against the vendored CoreUI CSS, with the intentional `cil-flask` compatibility alias.

## Known environment limitation
