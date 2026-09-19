# Thầy Gia Huy — Sidebar/Main Layout Fix

## Root cause
The legacy homepage used a fixed sidebar plus several competing `margin-left`, `--side-w`, and viewport-width rules. In collapsed mode the sidebar width changed, but the main content could still use a different offset/width calculation, allowing the sidebar to cover the left edge of the page content.

## Fix applied
A page-scoped final layout layer was added:

- `css/gh-sidebar-layout-final.css`
- Linked as the last homepage stylesheet in `index.html`.

The homepage now uses one source of truth:

- open sidebar: `220px`
- collapsed sidebar: `78px`
- sidebar left inset: `12px`
- layout gap: `20px`
- main left offset = sidebar left + sidebar width + gap

The Main content width is calculated from the available page width instead of using viewport-based `100vw` math.

## Required invariant
For desktop:

`main-left >= sidebar-left + sidebar-width + gap`

This prevents the sidebar from covering any main content.

## Responsive behavior
- Desktop: sidebar remains in its own visual rail; main reserves the rail width.
- Collapsed desktop: main expands automatically as sidebar width reduces.
- Mobile: the desktop sidebar rail is disabled and the existing mobile navigation behavior remains.

## Locked zones
These remain untouched:

- admin-panel.html
- admin-login.html
- guest-login.html
- login.html
- register.html
- student.html
- teacher-login.html
- teacher.html

## Validation
- Locked hashes: PASS
- JavaScript syntax: PASS
- CoreUI local CSS: PASS
- Dead `href="#"`: PASS on editable pages
- Removed PhET references: PASS
- Enhanced Game Center assets: PASS
