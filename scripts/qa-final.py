#!/usr/bin/env python3
"""Final QA for the editable Thầy Gia Huy website surface. Locked auth/panel files are immutable."""
from __future__ import annotations
import hashlib, json, re, subprocess, sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[1])
LOCKED = [
    "admin-login.html","admin-panel.html","guest-login.html","login.html",
    "register.html","student.html","teacher-login.html","teacher.html"
]
UNLOCKED = [
    "index.html","plugins.html","config.html","mods.html","assets.html","tools.html",
    "resources.html","guide.html","my-library.html","flashcards.html","quiz.html",
    "videos.html","games.html","statistics.html","notifications.html","profile.html",
    "settings.html","qna.html"
]

def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def fail(msg):
    print("[FAIL]", msg); raise SystemExit(1)

def ok(msg): print("[PASS]", msg)

expected = json.loads((ROOT/"LOCKED_FILES_SHA256.json").read_text(encoding="utf-8"))
for f in LOCKED:
    p=ROOT/f
    if not p.exists(): fail(f"missing locked file: {f}")
    if sha(p) != expected[f]: fail(f"LOCKED HASH CHANGED: {f}")
ok("All locked Panel/Login/Auth files are byte-for-byte unchanged")

for f in UNLOCKED:
    p=ROOT/f
    if not p.exists(): fail(f"missing unlocked page: {f}")
    s=p.read_text(encoding="utf-8", errors="replace")
    if "assets/vendor/coreui/css/free.min.css" not in s: fail(f"{f}: missing local CoreUI Icons stylesheet")
    if re.search(r'href\s*=\s*["\']#["\']', s): fail(f"{f}: dead href=# remains")
ok("Unlocked HTML has local CoreUI Icons and no dead href=#")

# No active simulation source/runtime should remain. Documentation files are intentionally not part of runtime checks.
active_files = list(ROOT.glob("*.html")) + list((ROOT/"js").glob("*.js")) + list((ROOT/"css").glob("*.css"))
active_text = "\n".join(p.read_text(encoding="utf-8", errors="ignore").lower() for p in active_files)
for needle in ("phet", "phetsims", "phet-source", "simulation.html", "simulations.html"):
    if needle in active_text: fail(f"active source still contains removed simulation reference: {needle}")
ok("Active runtime source contains no removed simulation/PhET references")

for p in sorted((ROOT/"js").glob("*.js")):
    proc=subprocess.run(["node","--check",str(p)],capture_output=True,text=True)
    if proc.returncode: fail(f"JS syntax error: {p.name}: {proc.stderr.strip()}")
ok("All JavaScript files pass node --check")

coreui=(ROOT/"assets/vendor/coreui/css/free.min.css").read_text(encoding="utf-8", errors="replace")
used=set()
for f in UNLOCKED:
    used.update(re.findall(r'\b(cil-[a-z0-9-]+)\b',(ROOT/f).read_text(encoding="utf-8",errors="ignore")))
missing=[]
for icon in sorted(used):
    if icon in {"cil-flask","cil-nav-ico"}: continue
    if f".{icon}:before" not in coreui: missing.append(icon)
if missing: fail("Possible missing CoreUI glyphs: "+", ".join(missing[:25]))
ok(f"CoreUI icon glyph coverage checked ({len(used)} names)")

if not (ROOT/"css/gh-games-pro.css").exists(): fail("missing enhanced game CSS")
if not (ROOT/"js/gh-games-pro.js").exists(): fail("missing enhanced game engine")
ok("Enhanced Game Center assets exist")

print("\nSummary: FINAL QA PASS")
