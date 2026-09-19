# Thầy Gia Huy — Visual/Layout Fix Report

## Root cause fixed
The unlocked homepage had conflicting late CSS rules assigning different sidebar widths and content offsets (200/204/210/218/232/244px). The final result could place the main `.content` under the 244px floating sidebar, clipping the left side of headings and cards.

## Fix applied
- Added scoped `body.gh-unlocked.gh-home` guard.
- Locked homepage sidebar at 244px width with a 10px left gutter.
- Set content offset to 268px at desktop and removed the old constrained `.shell` width that caused mis-centering.
- Restored `.latest`, `.history-section` and `.section` from the accidental `width:0;height:0;display:none` cascade.
- Kept responsive breakpoints and removed sidebar on mobile without touching locked pages.
- Added a unified Thầy Gia Huy brand system for unlocked/modern pages.
- Added a CoreUI-only icon compatibility layer for newly editable surfaces.
- Fixed video ObjectURL cleanup on every modal close path, including Escape/programmatic close.

## Locked zones
The following files are byte-for-byte verified against their stored SHA-256 hashes and were not modified:
- admin-login.html
- admin-panel.html
- guest-login.html
- login.html
- register.html
- student.html
- teacher-login.html
- teacher.html

## Validation
- Existing unlocked-source verification: PASS
- Final QA script: PASS
- All JavaScript files: `node --check` PASS
- CoreUI icon coverage: PASS

## Note
A headless Chromium screenshot could not be produced reliably in this environment because the browser process did not terminate cleanly. Static CSS/DOM analysis and source-level QA were completed instead.
