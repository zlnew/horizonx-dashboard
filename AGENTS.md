# AGENTS.md — horizonx-dashboard

Vue 3 dashboard for HorizonX. Local dev port 4959.

## Commands

```bash
npm run dev            # dev server
npm run test:unit:run  # unit tests, single run (use this, not watch)
npm run type-check     # vue-tsc
npm run lint
npm run check          # the done criterion
```

## Invariants

1. Use `test:unit:run`, never the watch runner, in agent sessions.
2. Never weaken a test or a type to make `check` pass. No `any`, no `@ts-ignore`, no skipped specs.
3. API calls go through the shared client. Do not hand-roll fetch in a component.
4. Port 4959 is dev. Never 4859, that belongs to the deployed installer.
5. Nothing is pushed. Local commits only.

## Branching

`feature/` or `fix/` off `develop`. Never commit to `main` or `develop`.
Commits: `type(scope): summary`.

## Done

`npm run check` exits 0.
