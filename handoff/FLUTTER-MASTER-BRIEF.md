# FitGuard Flutter — MASTER BRIEF (the only file you need)

## HOW TO USE THIS (read this part yourself)

This **one file replaces all the other handoff / instructions files** — ignore those.
Give your coding agent: **this file + open the team repo + the live API URL below.**

Your agent must do **Step 1 (verify your existing work) FIRST**. It does **not** delete
your work — it keeps everything that's already correct, fixes only what drifted from the
final API, then builds what's missing.

Then paste the block under **"PASTE THIS TO YOUR LLM"**.

---

## ════════ PASTE THIS TO YOUR LLM ════════

You are finishing the **FitGuard Flutter app** (`fit_guard_app`). Some existing code was
written against EARLY specs and may be outdated. The backend, AI plan service, and
on-device camera engine are now ALL **final and deployed**. Your job, in order:
**(1) verify existing code against the live API and fix drift, (2) use the already-built
camera engine, (3) finish the remaining screens.** **Keep all code that already matches —
do NOT delete working features.**

### THE SINGLE SOURCE OF TRUTH
- **Live API base:** `https://fitguard-api.fly.dev/api`
- **Live Swagger (browse it):** `https://fitguard-api.fly.dev/api-docs`
- **Machine-readable contract:** `https://fitguard-api.fly.dev/openapi.json`
- This deployed API is the truth. **If anything in old code or any doc conflicts with the
  live API, the live API wins.** This file gives the details; the live contract is final.

---

### STEP 1 — VERIFY existing code against the live API (DO THIS BEFORE ANY NEW WORK)

Do exactly this:
1. **Fetch the live contract:** `GET https://fitguard-api.fly.dev/openapi.json`. It lists
   every endpoint, method, request body, and response shape that actually exists.
2. **Find every API call already in the app** (search the code for `dio`/`http` calls).
3. **Check each call against the live contract:** does the path + method exist? do the
   request fields match? are you reading the response with the correct field names?
4. **Fix every mismatch.** Pay special attention to these — they are the things most
   commonly WRONG in code written against old specs:
   - **Base URL** must be `https://fitguard-api.fly.dev/api` in
     `lib/Core/network/dio_client.dart`. Any other value (an `onrender.com`, a `localhost`,
     an old fly URL) is wrong — fix it.
   - **Login returns `accessToken` + `refreshToken`** (NOT a single `token`). On any `401`,
     call `POST /auth/refresh` once with the stored refresh token, save the new tokens,
     retry the request. Logout = `POST /auth/logout`.
   - **Register takes `{ email, password }` ONLY.** The profile is a SEPARATE step:
     `POST /users/me/onboarding` with all profile fields **plus `disclaimerAccepted: true`**.
     If old code collects the profile during registration, split it.
   - **Onboarding auto-generates the AI plan** — do NOT call a plan endpoint afterward;
     show a loading state, then `GET /plans/me`.
   - **Plans are structured objects**, not arrays of strings:
     `workout.weeklySchedule[]` → each has `focus` + `items[]` (`trackedKey`, `sets`,
     `reps`, `restSeconds`, `intensity`); `nutrition` has `dailyCalories`, `protein_g`,
     `carbs_g`, `fat_g`, `mealStructure[]`. Render that structure.
   - **Workout sessions** identify each exercise by **`trackedKey`** (e.g.
     `"bodyweight_squat"`), NEVER a database id. Send raw `efforts` (reps + mistakes).
     **NEVER compute accuracy or injury-risk in the app** — the backend returns those.
   - **Reviews/transformations are SEPARATE calls** from the coach profile
     (`GET /coaches/:id/reviews`, `GET /coaches/:id/transformations`) — not nested in it.
   - **Any endpoint you call that isn't in the live Swagger → remove that call** and ask
     the backend dev; do not invent endpoints or fields.
5. **Output a table** before continuing: `feature | endpoints it used | correct now? | what I fixed`.

Do not start Step 3 until this table exists and the mismatches are fixed. Keep all already-correct code.

---

### STEP 2 — The CAMERA / CV is ALREADY BUILT. Do NOT rebuild or mock it.

A finished on-device Dart form-checker lives at `lib/Core/form_checking/`. Use it as-is:
- `import 'package:fit_guard_app/Core/form_checking.dart';`
- `final mgr = FormCheckingManager(); mgr.start('bodyweight_squat');`
- feed live camera frames to it; show `mgr.getLiveFeedback()` on screen; on finish:
  `final r = mgr.finish();`
- Submit it to the backend:
  ```json
  POST /workouts/sessions
  { "source":"device_cv", "endedAt":"<ISO time>",
    "efforts":[ { "trackedKey":"bodyweight_squat", "setsCompleted":3,
                  "correctReps": <r.correctReps>, "wrongReps": <r.wrongReps>,
                  "mistakes": <r.mistakes> } ] }
  ```
  (the backend computes `totalReps` from correct+wrong, and all accuracy/risk).
- See `lib/Core/form_checking/example_exercise_screen.dart` and
  `FORM_CHECKING_VERIFICATION_FINAL.md` for the exact API.
- **Hardest part:** wiring a real camera → on-device pose detection → this engine on a
  real phone (camera package, permissions, frame format). If you cannot get that pipeline
  working, STOP and flag it — that part needs the CV developer's help.

---

### STEP 3 — Build / finish the remaining screens (in this order)

Block the Workouts section until `onboardingCompleted == true`. One screen at a time,
test against the LIVE backend, then stop and report.

| Screen | Endpoint(s) | Key behavior |
|--------|-------------|--------------|
| Register / verify / login | `POST /auth/register`, `GET /auth/verify-email`, `POST /auth/login`, `/auth/refresh`, `/auth/logout` | email+password only; verify via email link; store access+refresh |
| Onboarding (+ disclaimer checkbox) | `POST /users/me/onboarding` | collect full profile incl `daysPerWeek`, `limitations`; require `disclaimerAccepted:true`; backend auto-makes the plan — show "building your plan…" then go Home |
| Home / plan | `GET /plans/me` | render structured workout + nutrition |
| Tracked workout | `GET /exercises/cv-config` → CV module → `POST /workouts/sessions` | use the form_checking module; show summary + any `riskAlert` from the response |
| Guided workout | `GET /exercises/:id` → `POST /workouts/sessions {source:"manual"}` | instructions + "mark complete" |
| Progress | `GET /progress/summary`, `/progress/risk`, `/progress/trends` | risk bands (low/moderate/elevated/high); handle `insufficient_data` |
| Coaches | `GET /coaches`, `/coaches/:id`, `/coaches/:id/reviews`, `/coaches/:id/transformations` | reviews/transformations are separate calls |
| Subscribe | `POST /subscriptions`, `GET/DELETE /subscriptions/me` | after subscribing, `GET /plans/me` keeps the AI plan until the coach authors one — show "awaiting coach plan" until `source:"coach"` |
| Become a coach | `POST /media` (multipart), `POST /coaches/applications` | upload ID/certs, then apply |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` | feed + mark read |
| Account | `DELETE /users/me` | delete (soft) own account |

---

### GOLDEN RULES
- Reuse the existing `dio` client + `pref_helpers` token storage — don't create new ones.
- Send `trackedKey` strings, never database ids. Never compute accuracy/risk in the app.
- Show loading states: onboarding/plan calls hit an AI service (a few seconds; the server
  may be waking from sleep).
- Do ONE task at a time, test against the live backend, then stop and report.
- If the live Swagger lacks something you expected, STOP and ask the backend dev.

### HOW TO TEST THE WHOLE THING
Register (real email) → verify via email link → login → finish onboarding → see the AI
plan → do a tracked squat with the camera → see summary + (after a few sessions) a risk
band → browse/subscribe to a coach. If each step shows real data from the live backend,
you're done.

## ════════ END OF LLM BLOCK ════════
