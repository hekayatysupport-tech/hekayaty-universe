# Hekayaty Universe Monorepo Memory

## System Architecture Overview
- **Type**: Monorepo managed via `pnpm` workspaces.
- **Backend**: Express 5 server in `artifacts/api-server` running on port 5000. Connected to PostgreSQL via Drizzle ORM in `lib/db`.
- **Frontend**: React 19 + Vite 7 + Tailwind 4 app in `artifacts/hekayaty-world` running on port 3000. Proxies `/api` to port 5000 via `vite.config.ts`.
- **API Spec & Codegen**: `lib/api-spec/openapi.yaml` defines the API contract. Running `pnpm --filter @workspace/api-spec run codegen` updates Orval React Query hooks in `lib/api-client-react` and Zod schemas in `lib/api-zod`.
- **Auth & Security**: Supabase Auth client-side (`AuthContext.tsx`). Backend validates Bearer JWT tokens (`/api/me`, `/api/admin/*`) and checks RBAC roles stored in `user_profiles` and `user_roles`.

## Quick Startup Commands
- Start API server: `pnpm --filter @workspace/api-server run dev`
- Start Client app: `pnpm --filter @workspace/hekayaty-world run dev`
- Regenerate API client: `pnpm --filter @workspace/api-spec run codegen`
- Push DB schema: `pnpm --filter @workspace/db run push`
- Workspace typecheck: `pnpm run typecheck`

## Recent Conversation Summary & Design Decisions
- **Rebranded**: Updated website name to **Hekayaty Universe** across `index.html`, `footer.tsx`, `NavbarUniverse.tsx`, `navbar.tsx`, `AdminLayout.tsx`, and `auth.tsx`.
- **Logo Typography**: `HEKAYATY UNIVERSE` styled at equal font size (`text-xl sm:text-2xl font-serif font-black tracking-wider`) with dual golden metallic gradients (`from-amber-300 via-amber-400 to-amber-500`) and glowing drop shadows.
- **Navbar Layout**: Changed container to `w-full px-4 sm:px-6 lg:px-8` so `HEKAYATY UNIVERSE` sits flush to the far left of the viewport.
- **Dev Servers Live**: Express API running on `http://localhost:5000` and Vite app running on `http://localhost:3000`.
- **Typecheck Status**: `pnpm run typecheck` verified cleanly with 0 errors.
