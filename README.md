<!-- krizaka-header -->
<div align="center">

<img src=".github/assets/orazaka-logo.svg" alt="Orazaka" width="420">

# Orazaka Web Admin

**The AI that never leaves home.**

Next.js SecOps & administration console of the Orazaka platform.

[![CI](https://github.com/krizaka/orazaka-web-admin/actions/workflows/ci.yml/badge.svg)](https://github.com/krizaka/orazaka-web-admin/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Orazaka](https://img.shields.io/badge/part%20of-Orazaka-f59e0b)](https://github.com/krizaka/orazaka#repositories)
[![Docs](https://img.shields.io/badge/docs-krizaka.com-6366f1)](https://www.krizaka.com/en/products/orazaka)

[Documentation](https://www.krizaka.com/en/products/orazaka) · [Website](https://www.krizaka.com) · [Krizaka on GitHub](https://github.com/krizaka)

</div>
<!-- /krizaka-header -->

**Layer:** Client application · **Version:** `1.0.0-SNAPSHOT` · **License:** Apache-2.0 ·
part of the [Orazaka platform](https://github.com/krizaka/orazaka) by [Krizaka](https://krizaka.com)

## What it provides

The SecOps / administration console (port `3001`): models, pipeline, features, billing and studio
administration. Built on [@krizaka/orazaka-design-system](https://github.com/krizaka/orazaka-ui-kit).

```bash
npm install && npm run dev
```

## Position in the platform

| | |
|:---|:---|
| Depends on | [`orazaka-ui-kit`](https://github.com/krizaka/orazaka-ui-kit) |
| Used by | _no other Orazaka repository._ |
| Workspace path | `orazaka-apps/ui/orazaka-web-admin` |

## Build

**Inside the Orazaka workspace** (npm workspaces link `@krizaka/*` packages from source):

```bash
git clone https://github.com/krizaka/orazaka.git && cd orazaka
node scripts/workspace.mjs clone
cd orazaka-apps/ui && npm install
```

**Standalone**: add `@krizaka:registry=https://npm.pkg.github.com` to `.npmrc`, then `npm install`.

Requirements: Node.js 22+.

## Governance

This repository follows the Orazaka governance contract — [AGENTS.md](https://github.com/krizaka/orazaka/blob/main/AGENTS.md)
in the workspace is normative; the local [AGENTS.md](AGENTS.md) only scopes it to this repository.

## License

Apache License 2.0 — see [LICENSE](LICENSE) and [NOTICE](NOTICE).
