# tanstack-start-react-starter

GitHub template to bootstrap full-stack React apps with [TanStack Start](https://tanstack.com/start), typed routing, and [Feature-Sliced Design](https://fsd.how/).

## Purpose

This repo is a **starter template**, not a product app. Clone or use it as a GitHub template when you want a ready-made baseline instead of wiring the stack from scratch.

It aims to give you:

- A working TanStack Start + React + Vite + TypeScript app out of the box
- An FSD-oriented `src/` layout (`app` / `pages` / `shared`) with scaffolding via `pnpm fsd`
- UI primitives (Tailwind, shadcn/ui, Base UI) without shipping demo business features
- Quality gates from day one: Biome, Steiger (FSD lint), Vitest, and Playwright

Use it as the foundation for a new project, then grow features inside the FSD layers.

## Table of contents

- [Purpose](#purpose)
- [Stack](#stack)
  - [Framework & routing](#framework--routing)
  - [Builder & language](#builder--language)
  - [UI](#ui)
  - [Architecture](#architecture)
  - [Quality & tests](#quality--tests)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Structure](#structure)

## Stack

### Framework & routing

- [React](https://react.dev/)
- [TanStack Start](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)

### Builder & language

- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [pnpm](https://pnpm.io/)

### UI

- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Base UI](https://base-ui.com/)
- [class-variance-authority](https://cva.style/docs)
- [Lucide](https://lucide.dev/guide/packages/lucide-react)
- [Inter (Fontsource)](https://fontsource.org/fonts/inter)

### Architecture

- [Feature-Sliced Design](https://fsd.how/)
- [@feature-sliced/cli](https://github.com/feature-sliced/cli)

### Quality & tests

- [Biome](https://biomejs.dev/guides/getting-started/)
- [Steiger](https://github.com/feature-sliced/steiger)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

## Getting started

```bash
pnpm install
pnpm dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm check` | Biome lint + format (report only, no writes) |
| `pnpm check:fix` | Biome lint + format, apply safe fixes |
| `pnpm lint:fsd` | FSD lint (Steiger) |
| `pnpm lint:all` | `check:fix` + Steiger |
| `pnpm fsd` | Scaffold FSD layers/slices ([CLI](https://github.com/feature-sliced/cli)) |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | E2E tests (Playwright) |

## Structure

```text
src/
  app/       # App init, TanStack routes, styles
  pages/     # Pages (FSD slices)
  shared/    # UI kit, utils (no business logic)
e2e/         # Playwright tests
```
