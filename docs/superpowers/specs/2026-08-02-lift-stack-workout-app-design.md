# Lift-Stack: Workout Assistant PWA — Design Spec

## Overview

Lift-stack is a personal workout assistant PWA running on a Raspberry Pi 4B (8GB). It provides exercise reference, workout planning, tracking, and template-based recommendations for 2 users (owner + sister). The app is LAN-only, deployed via Docker Compose, and uses Postgres as the shared database for future apps on the same Pi.

## Architecture

**Approach: Rich API, thin client** — Backend handles all business logic (exercise filtering, workout tracking, templates). Frontend is primarily display and form submission. Backend is a self-contained FastAPI service, independently deployable, with clear API boundaries.

**Stack:**
- Backend: Python 3.14.6, FastAPI, ruff (lint/format), pytest
- Frontend: React 19, Vite, dark mode, mobile-first responsive design
- Database: Postgres (shared across multiple apps on the Pi)
- Deployment: Docker Compose, FastAPI serves both API and frontend static files
- Media: References external `exercises-dataset` directory (1,324 exercises with GIFs/thumbnails)

**Constraints:**
- Pi 4B 8GB RAM — keep resource usage minimal
- LAN-only for now (Cloudflare tunnel possible in future)
- Postgres configured with `max_connections=10` to save RAM
- Online-only PWA (offline support deferred)

## Data Model

### Exercises Table
Imported from `exercises-dataset` JSON (1,324 records):
- `id` (string, PK) — dataset ID (e.g., "0001")
- `name` (string) — exercise name
- `category` (string) — body part category (e.g., "chest", "back")
- `body_part` (string) — same as category
- `equipment` (string) — required equipment (e.g., "dumbbell", "body weight")
- `target` (string) — primary target muscle
- `muscle_group` (string) — primary synergist muscle
- `secondary_muscles` (jsonb array) — additional muscles involved
- `instructions` (jsonb) — keyed by language code (en, es, it, tr, ru, zh, hi, pl, ko, fr)
- `instruction_steps` (jsonb) — same instructions split into step arrays per language
- `media_id` (string) — original media reference ID
- `image` (string) — path to 180x180 thumbnail
- `gif_url` (string) — path to 180x180 animation GIF

### Profiles Table
Simple auth for 2 users:
- `id` (uuid, PK)
- `name` (string) — display name (e.g., "Max", "Sis")
- `created_at` (timestamp)

### Workout Templates Table
Pre-built and user-created templates:
- `id` (uuid, PK)
- `name` (string) — e.g., "Push Day", "Leg Day"
- `description` (text, nullable)
- `is_system` (boolean) — true for app-provided templates
- `created_by` (uuid, nullable, FK to profiles) — null for system templates, profile ID for user-created

### Workout Template Exercises Table
Exercises in a template:
- `id` (uuid, PK)
- `template_id` (uuid, FK to templates)
- `exercise_id` (string, FK to exercises)
- `target_sets` (int, nullable)
- `target_reps` (int, nullable)
- `target_weight` (float, nullable)
- `order` (int) — display order

### Workouts Table
Completed workout sessions:
- `id` (uuid, PK)
- `profile_id` (uuid, FK to profiles)
- `template_id` (uuid, nullable, FK to templates) — null if custom workout
- `name` (string) — workout name
- `started_at` (timestamp)
- `completed_at` (timestamp, nullable)
- `notes` (text, nullable)

### Workout Sets Table
Individual sets performed:
- `id` (uuid, PK)
- `workout_id` (uuid, FK to workouts)
- `exercise_id` (string, FK to exercises)
- `set_number` (int)
- `reps` (int)
- `weight` (float, nullable) — null for bodyweight
- `duration_seconds` (int, nullable) — for cardio exercises
- `rest_seconds` (int, nullable)
- `notes` (text, nullable)
- `completed_at` (timestamp)

## API Design

### Profiles
- `GET /profiles` — list all profiles (for picker on startup)
- `POST /profiles` — create a new profile (name only)
- `GET /profiles/{id}` — get profile by ID

### Exercises
- `GET /exercises` — list with filters: `category`, `equipment`, `target`, `muscle_group`, `search` (name contains)
- `GET /exercises/{id}` — single exercise with full details (instructions, media paths)

### Workout Templates
- `GET /templates` — list all templates, optional filter `is_system`
- `GET /templates/{id}` — template with its exercises
- `POST /templates` — create user-created template (name, description, exercises with targets)
- `PUT /templates/{id}` — update user-created template (only if `is_system=false` and `created_by` matches)
- `DELETE /templates/{id}` — delete user-created template (only if `is_system=false` and `created_by` matches)

### Workouts
- `POST /workouts` — start new workout (name, optional template_id)
- `POST /workouts/{id}/sets` — add set (exercise_id, reps, weight, duration, rest, notes)
- `PUT /workouts/{id}` — update workout (mark completed, add notes)
- `GET /workouts` — list past workouts for profile (pagination: `limit`, `offset`)
- `GET /workouts/{id}` — full workout details with all sets

### System Templates
On first startup, migration script inserts system templates:
- "Push Day" (chest, shoulders, triceps)
- "Pull Day" (back, biceps)
- "Leg Day" (quads, hamstrings, glutes, calves)
- "Full Body" (compound movements)
- "Upper Body" (chest, back, shoulders, arms)
- "Lower Body" (legs, glutes)
- "Core" (abs, obliques)
- "Cardio" (bodyweight cardio)

Each has pre-selected exercises from the dataset with suggested sets/reps.

## Frontend UI/UX

### Screens

1. **Profile Picker** (startup)
   - Shows existing profiles as cards
   - "Add Profile" button
   - Stores last selected profile in localStorage

2. **Dashboard** (main screen)
   - Quick actions: "Start Workout", "Browse Exercises", "My Templates", "Workout History"
   - Last workout summary
   - Minimal stats (workouts this week)

3. **Exercise Browser**
   - Search bar (filter by name)
   - Filter dropdowns: category, equipment, target muscle
   - Grid of exercise cards (thumbnail, name, equipment)
   - Click card → detail modal (animation GIF, instructions, muscle info)

4. **Templates List**
   - Tabs: "System Templates" | "My Templates"
   - Each card: name, exercise count, muscle groups
   - "Create Template" button
   - Click → template detail

5. **Template Detail**
   - List of exercises with target sets/reps
   - "Edit" (user-created only)
   - "Start Workout" button

6. **Workout Session** (active)
   - Exercises in order
   - Log sets: reps, weight, duration (cardio)
   - Rest timer (configurable, default 90s)
   - Notes per set
   - "Finish Workout" button

7. **Workout History**
   - List of past workouts (date, name, duration, exercise count)
   - Click → detail

8. **Workout Detail** (past)
   - Date, duration, template used
   - All sets performed

### PWA Features
- `manifest.json` for installability (add to home screen)
- Responsive design (mobile-first for gym use)
- Dark mode (default)
- Lazy-load exercise GIFs (180x180, small but cache-friendly)

## Deployment

### Docker Compose
```
docker-compose.yml
├── backend (FastAPI + uvicorn, serves API + frontend static files)
└── postgres (with volume for data persistence)
```

Single port exposed (e.g., 8000). FastAPI serves both API endpoints and frontend from `frontend/dist`.

### Directory Structure on Pi
```
/home/max/lift-stack/              # Our repo
├── backend/
├── frontend/
├── docker-compose.yml
└── ...

/home/max/exercises-dataset/       # External dataset (cloned separately)
├── data/exercises.json
├── images/
└── videos/
```

### Environment Variables
```
DATABASE_URL=postgresql://liftstack:password@postgres:5432/liftstack
MEDIA_PATH=/data/exercises-dataset  # Mounted volume in container
```

### Docker Volumes
- `postgres_data` — Postgres data persistence
- `/home/max/exercises-dataset` → `/data/exercises-dataset` (read-only mount for media)

### Startup Flow
1. `docker compose up -d` starts Postgres + backend
2. Backend runs migration script on first startup (checks if exercises table is empty)
3. Migration loads exercises.json into Postgres, inserts system templates
4. App ready at `http://<pi-ip>:8000`

### Pi Resource Considerations
- FastAPI with single uvicorn worker (fine for 2-3 users)
- Postgres `max_connections=10`
- Frontend served as static files (no Node server in production)
- Estimated RAM: ~200-300MB for backend + Postgres

## Media Handling

Exercise media (GIFs, thumbnails) served by FastAPI from the mounted `exercises-dataset` directory:
- Backend mounts `/data/exercises-dataset/images/` and `/data/exercises-dataset/videos/` as static file directories
- Frontend requests media via API paths like `/media/images/0001-xxx.jpg` or `/media/videos/0001-xxx.gif`
- No duplication of media files in our repo

## Migration Script

One-time Python script that:
1. Checks if exercises table is empty
2. Reads `/data/exercises-dataset/data/exercises.json`
3. Inserts all 1,324 exercises into Postgres
4. Inserts system workout templates with pre-selected exercises
5. Logs success/failure

Runs automatically on backend startup if exercises table is empty.
