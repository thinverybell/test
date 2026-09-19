# Arduino Lab — Performance Edition

## What changed
- Library changed from eager rendering of the entire catalog to a virtualized 2-column list.
- Only rows near the visible scroll viewport are present in the DOM.
- Library thumbnails use local WebP images at 180×110 RGBA instead of full-size PNGs.
- Thumbnails are `loading="lazy"`, `decoding="async"`, and `fetchpriority="low"`.
- Full-size 2D PNGs are requested only by workbench components after a module is placed on the canvas.
- Search input is debounced to avoid rebuilding the catalog on every keystroke.
- Component drag no longer re-renders the entire workbench on every pointer move; the DOM position and wires are updated while dragging and a full render occurs on release.
- Initial default hardware is batched into a single render instead of rendering once per component.

## Kept features
- 247 modules and 94 board items.
- 4,213 ports in the current registry.
- Direct wire drag, snapping and two-end port labels.
- Single/double/triple/quad wire bundles.
- Board/breadboard quick add.
- Component move, rotate, duplicate, delete, scale and Ctrl+wheel scaling.
- Console, port validation, save/open/export, undo/redo, code view and run/stop controls.
