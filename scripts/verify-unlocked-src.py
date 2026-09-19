#!/usr/bin/env python3
"""Static regression checks for editable Thầy Gia Huy pages. Locked auth/panel pages remain immutable."""
from pathlib import Path
from bs4 import BeautifulSoup
import hashlib, json, re, sys

ROOT=Path(__file__).resolve().parents[1]
LOCKED={"admin-panel.html","admin-login.html","login.html","register.html","teacher-login.html","teacher.html","student.html","guest-login.html"}
EDITABLE={"index.html","plugins.html","config.html","mods.html","assets.html","tools.html","resources.html","guide.html","my-library.html","flashcards.html","quiz.html","videos.html","games.html","statistics.html","notifications.html","profile.html","settings.html","qna.html"}
failures=[]; checks=[]
def check(name, ok, detail=""):
    checks.append((name,ok,detail))
    if not ok: failures.append((name,detail))

expected=json.loads((ROOT/"LOCKED_FILES_SHA256.json").read_text(encoding="utf-8"))
for name in sorted(LOCKED):
    p=ROOT/name
    check(f"locked exists: {name}",p.exists())
    if p.exists(): check(f"locked hash: {name}",hashlib.sha256(p.read_bytes()).hexdigest()==expected[name])

coreui=ROOT/"assets/vendor/coreui/css/free.min.css"
check("CoreUI local CSS exists",coreui.exists())
for name in sorted(EDITABLE):
    p=ROOT/name
    if not p.exists(): check(f"editable page exists: {name}",False); continue
    s=BeautifulSoup(p.read_text(encoding="utf-8",errors="ignore"),"html.parser")
    links={x.get("href") for x in s.find_all("link",href=True)}
    check(f"{name}: local CoreUI linked","assets/vendor/coreui/css/free.min.css" in links)
    check(f"{name}: no dead href=#",'href="#"' not in p.read_text(encoding="utf-8",errors="ignore"))

active_files=list(ROOT.glob("*.html"))+list((ROOT/"js").glob("*.js"))+list((ROOT/"css").glob("*.css"))
active_text="\n".join(p.read_text(encoding="utf-8",errors="ignore").lower() for p in active_files)
for needle in ("phet","phetsims","phet-source","simulation.html","simulations.html"):
    check(f"removed reference absent: {needle}",needle not in active_text)

print("THẦY GIA HUY EDITABLE-SURFACE VERIFICATION")
for name,ok,detail in checks:
    print(f"[{'PASS' if ok else 'FAIL'}] {name}" + (f" :: {detail}" if detail else ""))
print(f"\nSummary: {len(checks)-len(failures)}/{len(checks)} checks passed.")
if failures: sys.exit(1)
