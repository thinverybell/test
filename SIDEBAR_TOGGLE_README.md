# Sidebar Toggle Upgrade — Thầy Gia Huy

## Added
- Expand/collapse control for the left navigation sidebar on unlocked pages.
- State persists in `localStorage` under `giahuy-sidebar-collapsed-v1`.
- Desktop shortcut: `Ctrl+B` / `Cmd+B`.
- CoreUI Icons used for the toggle (`cil-chevron-left` / `cil-chevron-right`).
- Collapsed state keeps icons visible and hides labels/secondary text.
- Mobile keeps the existing mobile behavior; the desktop toggle is hidden below 821px.

## Scope protection
The toggle CSS/JS is only loaded on unlocked pages and never loaded on:
- admin-login.html
- admin-panel.html
- guest-login.html
- login.html
- register.html
- student.html
- teacher-login.html
- teacher.html

No auth or panel source was edited.
