
# frontend1

Folder-first Next.js scaffold with role-based dashboard route protection.

## What Was Set Up

- Requested folder structure under `src/` and `public/`
- `.gitkeep` placeholders in empty folders so Git keeps them
- `PROJECT_STRUCTURE.md` with a clean tree view
- Role-based dashboard route guard in `src/middleware.ts`

## Role-Based Access (Current)

Protected routes:
- `/dashboard/admin/*` for `admin`
- `/dashboard/student/*` for `student`
- `/dashboard/tutor/*` for `tutor`

Middleware checks cookie:
- `user_role=admin`
- `user_role=student`
- `user_role=tutor`

If missing role:
- Redirects to `/auth/login?next=<path>`

If wrong role:
- Redirects to `/unauthorized`

## Files Added For Access Control

- `src/middleware.ts`
- `src/lib/routeRoles.ts`
- `src/app/unauthorized/page.tsx`

## Next Step

Connect your auth/login flow to set the `user_role` cookie after sign-in.
