# Repository Guidelines

## Project Structure & Module Organization
- `src/` – Vue 3 + TypeScript app: `config/` (primary app config), `composables/`, `features/`, `views/`, `utils/`, `components/` (PascalCase folders), `assets/`.
- `src-tauri/` – Tauri (Rust) backend: `src/` (Rust code), `tauri.conf.json` (plugins), `app.config.json` (generated; don’t edit).
- `scripts/` – Utility scripts (`sync-config.js`, `generate-icons.js`, `generate-tray-icon.js`).
- `public/` – Static files. `docs/` – Project documentation.

## Build, Test, and Development Commands
- `npm run tauri:dev` – Full app dev (frontend + Tauri). Recommended for local work.
- `npm run dev` – Frontend dev server only (Vite).
- `npm run tauri:build` – Production build for desktop app.
- `npm run build` – Build frontend only.
- `npm run sync:config` – Sync TypeScript config to Rust (regenerates `src-tauri/app.config.json`).
- `npm run lint` / `npm run format` / `npm run type-check` – Lint, format (Prettier), and TS type checking.

## Coding Style & Naming Conventions
- Indentation: 2 spaces (global), Rust 4 spaces (.editorconfig enforced).
- Vue: Composition API with `<script setup>`; TypeScript preferred; single quotes.
- Components/Views: PascalCase (e.g., `src/components/ThemeSwitch/ThemeSwitch.vue`).
- Linting/Formatting: ESLint + Prettier + Husky + lint-staged (runs on pre-commit).
- Rust: Follow standard style; run `cargo fmt` via your IDE or manually.

## Testing Guidelines
- No automated tests yet; perform manual flows with `npm run tauri:dev`.
- Validate core modules (updater, storage, shortcuts, notifications) on target OSes when possible.
- Add minimal reproduction steps in PR descriptions if fixing bugs.

## Commit & Pull Request Guidelines
- Use Conventional Commit prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
- Keep commits focused and descriptive. Example: `feat: add tray submenu for quick actions`.
- PRs must include: clear summary, motivation, implementation notes, screenshots/GIFs for UI, and linked issues.
- Ensure CI-like checks pass locally: `lint`, `type-check`, and a successful dev run.

## Security & Configuration Tips
- Manage secrets via `.env` (see `.env.example`); never commit secrets.
- Edit config in `src/config/**` only; then run `npm run sync:config`. Do not edit `src-tauri/app.config.json` directly.
- Tauri plugins are configured in `src-tauri/tauri.conf.json`; updater public key must be set there when enabling updates.

