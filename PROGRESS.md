# ResQMeal Progress

Project: ResQMeal, connecting Koramangala restaurants with NGOs and volunteers to rescue surplus food.
Stack: Vite + React, React Router, CSS. Supabase is reserved for Milestone 2.

## Milestone 1 status

### Completed (checked statically: files exist, imports resolve, routes wired)
- index.html, package.json, vite.config.js
- src/main.jsx (React 18, BrowserRouter, imports styles/global.css)
- src/App.jsx (route table: / , /restaurant , /ngo , /volunteer , * to NotFound)
- src/roles.js (three roles with paths and accent keys)
- src/components/: six shared components (AppLayout and related)
- src/pages/: Home, RestaurantDashboard, NgoDashboard, VolunteerDashboard, NotFound
- src/styles/global.css

### NOT VERIFIED
- `npm run build`: not verified. Rollup's native module is blocked by Windows Application Control (ERR_DLOPEN_FAILED). This needs IT approval or an approved exception. It has not been bypassed.
- Dashboard runtime tests for /restaurant, /ngo and /volunteer: not verified, because the dev server and build have not run.

### Pending
- Resolve the Rollup/Application Control block through an approved route.
- Run the production build and dev server.
- Test all three dashboards and their navigation.

### Not started
- Milestone 2 (Supabase, data layer).

## Notes
- No source files were changed by the progress-tracking step.
- Verification so far is static only: file existence, import paths and route wiring.

## Milestone 2 status (in progress)

### Files created or changed under Milestone 2
- src/lib/supabase.js (client, reads only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
- src/lib/donations.js (createDonation, listMyDonations)
- src/lib/donationValidation.js (enum lists and validateDonation)
- src/auth/AuthContext.jsx (AuthProvider, useAuth: email/password sign in, sign up, sign out)
- src/main.jsx (AuthProvider wrapped around the app)
- supabase/schema.sql (donations table, indexes, RLS policies)
- package.json (@supabase/supabase-js dependency)
- src/components/AuthPanel.jsx (new)
- src/components/DonationForm.jsx (new)
- src/components/DonationList.jsx (new)
- src/pages/RestaurantDashboard.jsx (rewritten; placeholder form removed)
- src/styles/global.css (rm- responsive rules appended)

### Schema decisions
- donations table columns: food_name, category, quantity, unit, prepared_at, pickup_by, storage_conditions, allergens, handling_instructions, status, created_at.
- Enum lists match src/lib/donationValidation.js (categories, units, storage conditions, allergens).
- RLS: insert own rows with status 'posted'; select own rows. No update or delete policies yet.

### NOT VERIFIED
- npm install status: see tester report; not re-run here.
- schema not run against a live database.
- no build (Rollup blocked by Windows Application Control); lint_file could not parse the new JSX files (esbuild unavailable).
- sign-in, sign-up and donation save not tested live.

### Pending Dashboard actions (Supabase)
- Run supabase/schema.sql in the SQL Editor.
- Confirm the Email provider is enabled.
- Set Site URL and redirect URL to http://localhost:5173 (assumed Vite default).

## Milestone 3: NGO discovery and claiming

### Implemented (code written, not yet verified)
- `supabase/ngo_claims.sql`: additive migration (revised). Adds `claimed_by` and `claimed_at` to `donations`, a partial index for available donations, and a `user_roles` table (role restricted to 'restaurant' or 'ngo'; RLS on; users can read only their own row and cannot insert, update or delete roles). The `ngo_select_available` SELECT policy now requires an 'ngo' role and returns posted donations with a future pickup deadline, plus the NGO's own claims. The `claim_donation(uuid)` function (security definer, `set search_path = ''`, schema-qualified) requires an 'ngo' role, uses a conditional UPDATE so only one claim can succeed, and is granted to authenticated users only. No UPDATE or DELETE policy is added for donations. Restaurant access relies on the pre-existing restaurant policy, which is not changed or checked here.
- `src/lib/claims.js`: list available donations, list my claims, claim via RPC.
- `src/lib/matching.js`: rule-based scoring (pickup deadline, quantity, allergens, cold storage). Each recommendation shows its reasons. No GPS or distance.
- `src/components/NgoDonationList.jsx`: donation cards with reasons and a Claim donation button.
- `src/pages/NgoDashboard.jsx`: replaces the placeholder. Gated by the existing AuthContext. Shows available donations, my claims, and handles claim errors and list refresh.
- `src/styles/global.css`: added `rm-ngo-badge` and `rm-ngo-label` rules.

### Unverified
- The SQL migration has NOT been applied to Supabase. It needs review and approval first.
- Production build (`npm run build`) has NOT been run in this milestone. The build run was declined during this session.
- Parse checks passed: `src/lib/matching.js` and `src/lib/claims.js` passed `node --check` (exit 0). `src/components/NgoDonationList.jsx` and `src/pages/NgoDashboard.jsx` passed esbuild parsing (exit 0). These are syntax checks only; no runtime or import resolution was checked.
- `src/styles/global.css` passed lint_file earlier. `PROGRESS.md` was not linted.
- End-to-end checks have NOT been run: restaurant donation visible to an NGO; first NGO claim succeeds; second claim fails safely; restaurant dashboard still works after the migration.
- The RLS policies and the claim function have not been tested against a live database.

