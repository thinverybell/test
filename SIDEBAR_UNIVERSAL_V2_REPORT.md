# Sidebar Universal V2

- Removed the competing `gh-unified-sidebar.js` controller from unlocked public pages so `gh-navigation-master.js` is the single sidebar/top-nav writer.
- Added `css/gh-navigation-universal-final.css` after all previous navigation CSS, making all sidebar items use identical width/height/padding/radius/icon box.
- Home (`Trang chủ`) now uses the exact same row geometry as every other item.
- Active state is explicit via `active`, `gh-nav-current`, and `aria-current="page"` on both sidebar and top navigation.
- Group headings are fixed-height and cannot resize navigation rows.
- Collapse state keeps identical row geometry and active glow.
- Regression: 18/18 PASS.
