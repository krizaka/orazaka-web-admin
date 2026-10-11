# orazaka-web-admin — Governance scope (agent-neutral)

> This repository is one component of the **Orazaka platform**. The normative contract is
> [`AGENTS.md`](https://github.com/krizaka/orazaka/blob/main/AGENTS.md) at the root of the Orazaka workspace
> ([`krizaka/orazaka`](https://github.com/krizaka/orazaka)), together with its `.agent/rules/*`. When this repository
> is cloned inside the workspace (`orazaka-apps/ui/orazaka-web-admin`), that contract is loaded first and applies
> without exception. **No rule lives here** — this file only scopes it.

## Scope of this repository

- **Role:** Next.js SecOps & administration console of the Orazaka platform.
- **Layer:** Client application
- **Depends on:** orazaka-ui-kit — never on another repository's Tier-3 implementation (AGENTS.md §2, [SEAM-002]).
- **Workspace path:** `orazaka-apps/ui/orazaka-web-admin`

## Definition of done

1. `npm run validate` (or `lint` + `build`) is green inside the workspace (`orazaka-apps/ui`).
2. No hard-coded colors, 250-line cap per component, types only from `@krizaka/orazaka-shared` (AGENTS.md §8).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
