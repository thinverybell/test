# LAB Test Report

**Date:** 2026-09-19

## Automated checks

| Check | Result |
|---|---:|
| Prompt module extraction | PASS — 200 |
| Catalog module count | PASS — 200 |
| Stable module IDs | PASS |
| Catalog names/variants match prompt | PASS |
| Contract field count | PASS — 41 |
| Contract fields present in every module | PASS |
| Honest verification defaults | PASS — 198 unverified + 2 verified behavioral |
| Verified board sources | PASS — 2 |
| Required lab UI controls | PASS |
| Core lab functions | PASS |
| Netlist independent from pixel coordinates | PASS |
| Wire add creates Undo snapshot | PASS |
| Port metadata guard | PASS |
| Responsive Console drawer | PASS |
| Sidebar navigation | PASS |
| Home navigation | PASS |
| Error taxonomy | PASS |
| Strict/Sandbox flow contract | PASS |

**Lab regression:** 18/18 PASS

**JS syntax:** all files in `js/`, `server/`, `server/routes/` and `tools/` PASS with `node --check`.

**Static asset references:** 25 references in `lab.html`; missing files: 0.

## Environment limitation

A full interactive Chromium smoke test was attempted, but this environment blocks loopback/file navigation for headless Chromium. Therefore this report does **not** claim an E2E browser pass.

## Scope limitation

The implementation is a web-based educational simulator with a browser compiler-lite and behavioral runtime. It does not claim native/hardware-in-the-loop simulation for the 200-module catalog. Module support labels are intentionally conservative.
