# HealthCode Studio - Technical Specification

## 1. Project Overview

**Project Name:** HealthCode Studio
**Type:** Full-stack AI coding platform / Low-code health app generator
**Core Functionality:** Natural language → complete health & wellness applications (fitness trackers, mental health journals, nutrition planners, sleep analyzers)
**Target Users:** Health-conscious developers, wellness coaches, fitness professionals, and anyone wanting personalized health apps without coding knowledge.

## 2. Architecture

```
healthcode-studio/
├── apps/
│   ├── web/              # Next.js 15 PWA frontend
│   ├── desktop/          # Tauri desktop wrapper
│   └── api/              # FastAPI backend
├── packages/
│   ├── ui/               # shadcn/ui components
│   ├── types/            # Shared TypeScript types
│   └── agent/            # Agentic code generation logic
├── templates/            # Pre-built health app templates
├── docker/               # Docker configurations
├── .github/workflows/    # CI/CD pipelines
└── SPEC.md
```

## 3. Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x + shadcn/ui
- **State:** Zustand + React Query
- **Charts:** Recharts / Tremor
- **PWA:** next-pwa with Workbox

### Desktop
- **Framework:** Tauri 2.x
- **Frontend:** Same as web app

### Backend
- **Framework:** FastAPI 0.115+
- **Language:** Python 3.12+
- **Database:** SQLite (local-first) with SQLAlchemy
- **AI:** Ollama integration (Llama 3.2, CodeQwen)
- **Testing:** Playwright

## 4. Feature Specifications

### 4.1 Prompt-to-App
- Natural language input field
- AI parses intent: app type, features, data models, UI components
- Generates complete Next.js app with:
  - Dashboard with charts
  - Forms for data entry
  - Local SQLite persistence
  - Responsive design
  - PWA manifest

### 4.2 Agentic Flow
1. **Research Agent:** Fetches health guidelines (WHO, NIH), validates against templates
2. **Code Agent:** Generates full application using template system
3. **Test Agent:** Playwright tests for offline functionality
4. **Package Agent:** Builds PWA or Tauri executable

### 4.3 Privacy-First
- All data stored locally in SQLite
- Optional E2E encrypted cloud sync
- Mock wearable data integration (Apple Health, Google Fit)
- No telemetry without explicit consent

### 4.4 Template Marketplace
- Pre-built templates:
  - Daily Mood & Workout Tracker
  - Nutrition Planner with macro calculator
  - Sleep Quality Analyzer
  - Meditation & Mindfulness Journal
  - Habit Streak Tracker
  - Hydration Reminder
- Community uploads with rating system

### 4.5 One-Click Export
- Download as ZIP (full Next.js project)
- Generate PWA for immediate use
- Build Tauri desktop app
- Deploy to Vercel/Netlify

## 5. UI/UX Design

### Color Palette
- **Primary:** #10B981 (Emerald green - health/vitality)
- **Secondary:** #3B82F6 (Blue - trust/calm)
- **Accent:** #F59E0B (Amber - energy)
- **Background:** #FAFAFA (Light) / #0F172A (Dark)
- **Text:** #1F2937 (Light) / #F3F4F6 (Dark)

### Typography
- **Headings:** Inter (600, 700)
- **Body:** Inter (400, 500)
- **Code:** JetBrains Mono

### Layout
- Sidebar navigation (collapsible)
- Main content area with breadcrumbs
- Bottom action bar for primary actions
- Modal system for confirmations

## 6. Database Schema

```sql
-- Apps generated
CREATE TABLE apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  code_path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User data per app (local-first)
CREATE TABLE app_data (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  data JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES apps(id)
);

-- Templates
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  code_template TEXT NOT NULL,
  preview_image TEXT,
  downloads INTEGER DEFAULT 0,
  rating REAL DEFAULT 0
);

-- Sync queue (offline-first)
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL,
  payload JSON NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 7. API Endpoints

```
POST /api/apps/generate     - Generate new app from prompt
GET  /api/apps              - List user's apps
GET  /api/apps/{id}         - Get app details
DELETE /api/apps/{id}       - Delete app

GET  /api/templates         - List marketplace templates
POST /api/templates         - Upload community template
GET  /api/templates/{id}    - Get template details

POST /api/ai/research       - Research health guidelines
POST /api/ai/generate       - Generate code with Ollama

GET  /api/sync/status      - Check sync status
POST /api/sync/push        - Push local changes
POST /api/sync/pull        - Pull remote changes
```

## 8. Security Considerations

- All local data encrypted at rest (SQLCipher)
- API authentication via local session token
- CSP headers enabled
- No eval() in code generation
- Sandboxed template execution
- Rate limiting on AI endpoints

## 9. Offline PWA Requirements

- Service worker caching all assets
- IndexedDB for local data
- Background sync for data queue
- Install prompt handling
- Offline fallback page
- App shell architecture

## 10. Acceptance Criteria

- [ ] User can type "build me a daily mood + workout tracker with AI tips"
- [ ] AI generates complete functional app in < 2 minutes
- [ ] Generated app works offline as PWA
- [ ] Data persists locally in SQLite
- [ ] App can be exported as desktop Tauri app
- [ ] Template marketplace displays 6+ pre-built templates
- [ ] Docker compose starts Ollama + API locally
- [ ] GitHub Actions builds and tests on PR
- [ ] PWA installable on iOS/Android/Desktop
