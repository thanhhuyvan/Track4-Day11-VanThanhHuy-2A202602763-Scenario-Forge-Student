# Day11 local setup

Student: Văn Thành Huy. Lab MSSV: 202602763 (user-approved removal of 2A prefix from 2A202602763). Town B.

Python 3.12.10 in .venv; numpy 2.5.4, pytest 9.1.1. Node.js v24.21.0 installed.

PowerShell commands from this directory:

```powershell
.\.venv\Scripts\python.exe -X utf8 run_all.py world
.\.venv\Scripts\python.exe -X utf8 -m pytest -q tests/test_parity.py
.\.venv\Scripts\python.exe -X utf8 -m pytest -q tests/test_todos.py
```

No activation required. TODO tests are expected to fail until Stage 2 implementation.
Open viewer/index.html in a browser to view the simulator; later import evidence/viewer.json in chapter 9.

Stage 1 world run: full budget, not --quick. Reactive world: zero collisions; replay: ego/TG contact at t=14.8 seconds, flagged fake. Files evidence/meta.json and evidence/world.json are generated locally. Evidence is ignored by the original .gitignore; final submission must deliberately include required evidence.

Windows sandbox initially blocked a NumPy DLL with Application Control. Running the same interpreter outside the sandbox succeeded, without changing Windows security settings.

Stage 1 verification: tests/test_parity.py — 10 passed in 89.99 seconds. Python and JavaScript simulator parity confirmed.

## Stage 2 implementation

Implemented the ten functions in lab11 only: vectorized leader TTC and contact geometry, trajectory progress/harsh braking, physical feasibility, Wilson interval, stable CEM elite update, defensive-mixture log weights, ordinary IS estimate and Kish ESS, ordered failure classification, and TRAIN-only policy ranking.

Public TODO tests: 31 passed. Additional checks passed for stable equal-score CEM ranking, Wilson zero/all-event endpoints, and tiny-weight ESS. No changes to avsim/, run_all.py, tests/ or policy_candidates.json. Later stages must interpret zero-hit estimates with the pipeline's upper bounds, not as proof of zero risk.

Stage 2 full verification: 41 tests passed in 34.25 seconds (31 TODO tests + 10 Python/JavaScript parity tests).

## Stage 3 completed (full budgets, no --quick)

Replay: 400 scenarios, no human-crash logs dropped, replay 121 collisions (110 rear, 11 side), reactive zero observed. MC: 3 crashes / 3000, all bus_bypass, Wilson [0.0003401410630, 0.0029361968105]. Zero-hit modes have upper bound 0.0012788956648, not proven zero risk.

Hunt: four modes x eight rounds x 300 samples = 9600 cloud points. Required bus_bypass and crosswalk_block failures both found. Mode-target search outcomes:

| Cuộc săn | Các kiểu tìm được | Bất khả thi bị loại |
|---|---|---:|
| bus_bypass | {'bus_bypass': 163} | 2 |
| cut_in | {'bus_bypass': 30, 'crosswalk_block': 2} | 2 |
| crosswalk_block | {'crosswalk_block': 64, 'bus_bypass': 1} | 28 |
| rear_ended | {'bus_bypass': 36, 'crosswalk_block': 3} | 7 |

Files: evidence/replay.json, mc.json, hunt.json, cloud.json, meta.json. Simulator seeds unchanged. Approximate runtimes: replay 28 s, MC 47 s, hunt 172 s. Next stage: importance sampling estimate (three seeds).

## Stage 4 completed

Full importance sampling: 3 seeds x 4 modes x 600 samples = 7200 additional samples; budget including hunt = 16800. Runtime about 249 seconds. Total estimates: [0.0017715020489589537, 0.0008765616694409755, 0.0013334928953450914]. Median 0.0013334928953450914. Zero-hit cut_in/rear_ended require upper_zero_hits=0.025 per seed/mode. Crosswalk_block seed 2 top_share=0.9948983 indicates severe one-sample dominance. REPORT question 4 includes all 12 rows and limitations. Evidence provenance and zero-hit formula verified; simulator/seed unchanged.

## Stage 5 completed

Full fix runtime about 990 seconds on this host. All 12 original candidates evaluated on TRAIN; chosen cutinLat=3.0 verified against choose_policy. TEST re-hunts performed for chosen and baseline; each has two modes x 400 IS samples plus 3000 natural holdout scenarios. Chosen TEST fail=3.824345667584607e-08, fail_hi=0.03877897158564074; baseline fail=0.0006906344950796566, fail_hi=0.0025175800115916935. Progress loss 0.074741%. Zero-hit bus_bypass bound retained.

Export: 11 runs and 6000 cloud points. Real viewer screenshots in evidence/shots, captured with Chrome/Playwright; comparison adds FIX-01 to viewer_capture.json without modifying the official viewer/core. Browser dependency was reused from an existing local Playwright installation. Original avsim/, viewer/, tests/, run_all.py, policy_candidates.json unchanged.
