# AGENTS.md

## Project
lift-stack — a PWA exercise app that runs on a Raspberry Pi 4B (8GB). Keep runtime memory/CPU usage in mind when adding dependencies and features.

## Stack

### Backend
- Python 3.14.6
- FastAPI
- ruff for linting, type checking, and formatting
- pytest for tests

### Frontend
- React + Vite

### CI/CD
- GitHub Actions. Stages: lint, unit tests, build. Deploy to k3s later (k3s not set up yet — CI only for now).

## Layout
```
backend/   FastAPI app + tests
frontend/  React + Vite app
.github/   GitHub Actions workflows
```

## Backend structure
- `backend/app/` — application package
- `backend/tests/` — pytest tests
- `backend/pyproject.toml` — dependencies and tool config

## Conventions
- Backend code: type hints on all public functions.
- Formatting/linting is enforced by ruff; keep `ruff check .` and `ruff format .` clean.
- Write tests with pytest alongside the code they cover.

## Workflow
- Follow the repo's branch flow.
- Branch naming: `number-name-of-branch` (incremental number per feature, e.g., `1-bootstrap-project`, `2-planning`, `3-ai-agent-planning`)
- **Always confirm before committing** — ask for explicit approval before any commit or push.
- Use **conventional commits** format: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Do not commit or push unless explicitly asked.

## Pending decisions
- [ ] Deploy pipeline design (k3s) — revisit once cluster exists
