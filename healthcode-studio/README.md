# HealthCode Studio

<div align="center">

![HealthCode Studio](https://img.shields.io/badge/HealthCode-Studio-10B981?style=for-the-badge&logo=heartbeat&logoColor=white)
[![MIT License](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-10B981?style=for-the-badge&logo=tauri)](https://tauri.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-10B981?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)

**AI-powered health & wellness app generator** — Build fitness trackers, mental health journals, nutrition planners, and sleep analyzers with natural language.

[Getting Started](#-getting-started) • [Features](#-features) • [Documentation](#-documentation) • [Development](#-development) • [Deployment](#-deployment)

</div>

---

## 🎯 What is HealthCode Studio?

HealthCode Studio is a **self-hosted AI coding platform** that transforms natural language descriptions into complete, production-ready health & wellness applications.

### Example Prompts

```text
"Build me a daily mood + workout tracker with AI tips"
"Create a nutrition planner with macro calculator"
"Make a sleep quality analyzer with weekly charts"
"Design a habit streak tracker with reminders"
```

### What Gets Generated

- ✅ Complete Next.js 15 application
- ✅ Responsive UI with Tailwind CSS & shadcn/ui
- ✅ Local SQLite database with offline support
- ✅ PWA manifest and service worker
- ✅ Charts and data visualization
- ✅ AI-powered tips and insights
- ✅ Export as desktop app (Tauri)

---

## ✨ Features

### 1. Prompt-to-App
Natural language input → complete health app in minutes. No coding required.

### 2. Agentic AI Flow
Four-stage AI agent ensures quality:
- **Research** — Validates against WHO/NIH guidelines
- **Code** — Generates full-stack application
- **Test** — Playwright tests for offline functionality
- **Package** — Builds PWA or desktop executable

### 3. Privacy-First Architecture
- All data stored locally in SQLite
- No cloud dependency required
- Optional encrypted cloud sync
- No telemetry or tracking

### 4. Template Marketplace
Pre-built templates ready to use:
- Mood & Workout Tracker
- Nutrition Planner with Macro Calculator
- Sleep Quality Analyzer
- Mindfulness Journal
- Hydration Reminder
- Habit Streak Tracker

### 5. Multi-Platform Export
- **PWA** — Install on any device
- **Tauri Desktop** — Native Windows/macOS/Linux apps
- **Static Export** — Deploy to Vercel, Netlify, etc.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+ (for API)
- Docker & Docker Compose (for local Ollama)
- Git

### Quick Start (Development)

```bash
# Clone the repository
git clone https://github.com/your-org/healthcode-studio.git
cd healthcode-studio

# Install dependencies
npm install

# Start development servers
npm run dev
```

This starts:
- **Web App**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### With Ollama (AI Generation)

```bash
# Start Ollama and API with Docker
cd docker
docker-compose up -d

# Pull AI models
docker exec docker-ollama-1 ollama pull llama3.2
docker exec docker-ollama-1 ollama pull codeqwen
```

### Offline PWA Setup

```bash
# Build the PWA
npm run build --workspace=@healthcode/web

# The PWA is ready in apps/web/.next/pwa/
# Serve with any static file server
npx serve apps/web/.next -p 3000
```

---

## 📁 Project Structure

```
healthcode-studio/
├── apps/
│   ├── web/              # Next.js 15 PWA frontend
│   │   ├── app/          # App router pages
│   │   ├── components/  # UI components
│   │   ├── stores/      # Zustand state management
│   │   ├── lib/         # Utilities & IndexedDB
│   │   └── tests/       # Playwright E2E tests
│   ├── api/             # FastAPI backend
│   │   ├── main.py      # API routes
│   │   └── Dockerfile
│   └── desktop/          # Tauri desktop app
│       └── src-tauri/   # Rust backend
├── packages/
│   ├── ui/              # Shared shadcn/ui components
│   ├── types/           # Shared TypeScript types
│   └── agent/           # AI code generation logic
├── templates/           # Pre-built health app templates
├── docker/              # Docker configurations
├── .github/workflows/   # CI/CD pipelines
└── SPEC.md             # Technical specification
```

---

## 🎨 UI/UX Design

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Emerald | `#10B981` | Primary (health/vitality) |
| Blue | `#3B82F6` | Secondary (trust/calm) |
| Amber | `#F59E0B` | Accent (energy) |
| Background | `#FAFAFA` | Light mode |
| Background Dark | `#0F172A` | Dark mode |

### Typography

- **Headings**: Inter (600, 700)
- **Body**: Inter (400, 500)
- **Code**: JetBrains Mono

---

## 🔧 Development

### Available Scripts

```bash
# All workspaces
npm run dev          # Start all apps in dev mode
npm run build        # Build all apps
npm run lint         # Lint all apps
npm run test         # Test all apps

# Web app only
npm run dev --workspace=@healthcode/web
npm run build --workspace=@healthcode/web
npm run test:e2e --workspace=@healthcode/web

# API only
npm run dev --workspace=@healthcode/api
```

### Environment Variables

```env
# API (apps/api/.env)
DATABASE_URL=sqlite:///./healthcode.db
OLLAMA_URL=http://localhost:11434
NODE_ENV=development

# Web (apps/web/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests (requires dev server)
npm run test:e2e

# With Playwright UI
npx playwright test --ui
```

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy web app
cd apps/web
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
```

### Build Desktop App

```bash
# Build Tauri app (requires Rust toolchain)
cd apps/desktop
npm run build
```

Output: `apps/desktop/src-tauri/target/release/bundle/`

### Docker Deployment

```bash
# Build API image
docker build -t healthcode-api ./apps/api

# Run with Docker Compose
cd docker
docker-compose up -d
```

### GitHub Actions

Automated builds on every push:

```yaml
# .github/workflows/release.yml
on:
  push:
    tags:
      - 'v*'
```

---

## 🔒 Security

- All local data encrypted at rest
- API authentication via local session tokens
- CSP headers enabled
- No eval() in code generation
- Sandboxed template execution
- Rate limiting on AI endpoints

---

## 📚 Documentation

- [Technical Specification](./SPEC.md)
- [API Documentation](./apps/api/README.md)
- [PWA Setup Guide](./docs/pwa-setup.md)
- [Template Development](./docs/templates.md)
- [Offline Mode](./docs/offline.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Tauri](https://tauri.app) - Desktop framework
- [Ollama](https://ollama.com) - Local AI
- [FastAPI](https://fastapi.tiangolo.com) - Python API framework
- [WHO](https://who.int) & [NIH](https://nih.gov) - Health guidelines

---

<div align="center">

**Built with ❤️ for the health & wellness community**

</div>
