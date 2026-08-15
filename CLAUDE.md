# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js, http://localhost:3000)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint (next lint)
```

There is no test suite/framework configured in this repo (no jest/vitest, no `*.test.*` files).

Note: `next.config.js` sets `eslint.ignoreDuringBuilds: true`, so `npm run build` will succeed even with lint errors — run `npm run lint` separately to actually check.

## Architecture

This is the Next.js 15 (App Router) frontend for **Mentora.lk**, a tutoring marketplace with three user roles: `admin`, `student`, `tutor`. It talks to a separate backend API (not in this repo) at `NEXT_PUBLIC_API_URL` (`.env.local`, defaults to `http://localhost:5000/api`).

### Role-based routing

- `src/middleware.ts` gates every `/dashboard/*` route based on a plain `user_role` cookie (`admin` | `student` | `tutor`), set client-side via `document.cookie` right after login (see `src/app/auth/login/page.tsx`).
  - No cookie → redirect to `/auth/login?next=<path>`.
  - Wrong role for the path prefix → redirect to `/unauthorized`.
- `src/lib/routeRoles.ts` holds the `UserRole` type and the `canAccessPath`/`isUserRole` logic the middleware uses. Each role's dashboard lives under its own top-level folder: `src/app/dashboard/admin/`, `src/app/dashboard/student/`, `src/app/dashboard/tutor/`.
- This cookie check is coarse (route-prefix only) — it is **not** the auth mechanism itself, just route gating. Actual auth state is the JWT described below.

### Auth model

- No real auth context/provider exists yet — `src/context/authContext.tsx` and `src/hooks/useAuth.ts` are stub files (`// TODO: implement this later`). Pages currently read/write auth state directly via `localStorage`.
- On login (`authService.login`), the JWT is stored as `localStorage["token"]` and the user object as `localStorage["user"]`; the `user_role` cookie is set separately for the middleware.
- `src/lib/api.ts` exports two ways to call the backend, both used across the codebase:
  - `api` — an Axios instance with a request interceptor that injects `Authorization: Bearer <token>` from `localStorage`, and a response interceptor that clears the token and hard-redirects to `/auth/login` on 401.
  - `apiCall<T>(endpoint, options)` — a `fetch` wrapper used wherever `FormData`/file uploads or more manual control is needed. It does **not** auto-inject auth headers; callers are expected to build them (most services define a local `getAuthHeaders()` helper reading `localStorage["token"]`).
  - Both normalize away a leading `/api/` in the endpoint before appending it to `API_BASE_URL` (which already ends in `/api`), so service calls consistently pass paths like `/api/tutor/communities`.

### Service layer

`src/services/*.ts` is one file per backend domain (`authService`, `classService`, `tutorService`, `tutorCommunityService`, `studentCommunityService`, `messagingService`, `booking`, `enrollmentService`, `notification`, `review`, `userService`). These are the only place API endpoint paths should live — pages/components call into services rather than hitting `apiCall`/`api` directly. When wiring a new feature, check whether an equivalent tutor/student pair of endpoints already exists (community features in particular have separate `tutorCommunityService.ts` / `studentCommunityService.ts` files that often proxy to the same backend routes with different auth headers).

Real-time messaging is a raw `WebSocket` (not `socket.io-client`, despite it being a listed dependency): `messagingService.ts` opens `ws(s)://.../ws/conversations/{id}?token=...` and `hooks/useWebSocket.ts` wraps connect/disconnect lifecycle + message state for components. **This is currently non-functional against the real backend on `main`/`Ryan`** — there is no `/ws/conversations/*` route there; the backend only runs Socket.io (a different handshake than raw WS) for community room events. A working DM backend (REST `/api/messages/*` + Socket.io `user:<id>` rooms) exists unmerged on the backend's `origin/Nishitha` branch — see that repo's `CLAUDE.md` before rebuilding this feature.

### UI structure

- `src/components/dashboard/` holds the shared dashboard chrome: `DashboardLayout.tsx` + `Sidebar.tsx` for the student dashboard, `TutorDashboardLayout.tsx` + `TutorSidebar.tsx` for the tutor dashboard. Admin dashboard pages currently compose their own layout inline.
- Styling is predominantly inline `style={{...}}` objects on elements (not CSS modules/classnames), including animation keyframes injected via a `<style>` tag inside layout components. Tailwind (`@tailwindcss/postcss`) is configured and `src/styles/globals.css` contains `@import "tailwindcss"`, but that stylesheet is **not currently imported** into `src/app/layout.tsx` — don't assume Tailwind utility classes are active without checking that a page/layout actually pulls in the CSS.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`) — use it for all intra-`src` imports instead of relative paths.

### Directory-per-role convention

Feature folders mirror the three roles almost everywhere they diverge (e.g. `app/dashboard/tutor/community/` vs `app/dashboard/student/community/`, `tutorCommunityService.ts` vs `studentCommunityService.ts`). When fixing a bug reported for one role, check whether the same logic is duplicated for the other role(s) and needs the same fix.
