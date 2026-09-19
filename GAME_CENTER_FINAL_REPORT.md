# Thầy Gia Huy — Game Center Final Repair

## Scope
- Removed PhET simulation pages, source folders, fetch/build scripts, old backup runtime, and active runtime references from the editable site.
- Kept Panel/Login/Auth pages byte-for-byte unchanged.
- Kept the collapsible sidebar feature.
- Kept local CoreUI Icons as the icon system for new editable UI.

## Game Center
- 12 playable canvas games remain:
  1. Neon Racer
  2. Galaxy Defender
  3. Sky Runner
  4. Cyber Blaster
  5. Survival Arena
  6. Tank Arena
  7. Brick Breaker
  8. Fruit Rush
  9. Hoop Master
  10. Strike Bowling
  11. Neon Dodge
  12. Mini Tower Defense
- Added combo scoring and streak feedback.
- Added pause/restart.
- Added local high scores.
- Added audio toggle.
- Added fullscreen mode.
- Added keyboard, pointer and touch controls.
- Added game-over/restart overlay.
- Improved Tower Defense with tower levels and upgrades.
- Added contextual HUD for Wave/Base or Frame where appropriate.

## Validation
- 58/58 editable/locked/source checks PASS in scripts/verify-unlocked-src.py.
- Final QA PASS in scripts/qa-final.py.
- All JavaScript files pass node --check.
- Runtime smoke test PASS for all 12 games.
- HTTP smoke test PASS for all 26 HTML pages.
- All 8 locked Panel/Login/Auth hashes match LOCKED_FILES_SHA256.json.
- Active runtime HTML/CSS/JS contains no PhET/simulation runtime references.
