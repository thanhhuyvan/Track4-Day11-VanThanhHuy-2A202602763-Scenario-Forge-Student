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
