# ⚡ VigOps — DevOps Intelligence Platform

Real-time GitHub PR analysis dashboard that detects infrastructure risks, estimates cost impact, and simulates deployment scenarios — all before you merge.

![Stack](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)

---

## How It Works

```
GitHub PR Event → Webhook → VigOps Backend → Risk Analysis → Live Dashboard
```

1. A pull request is opened/updated in your GitHub repo
2. GitHub sends a webhook to the VigOps backend
3. The backend analyzes the PR for infrastructure risks, security issues, and cost impact
4. Results appear in real-time on the dashboard with risk scores, detected issues, and recommendations

---

## Quick Start

### One-Command Launch

```bash
./vigops.sh start
```

This single command will:
- Install all dependencies (backend + frontend)
- Start the backend server on `http://localhost:4040`
- Start the frontend dashboard on `http://localhost:5173`
- Open an ngrok tunnel for GitHub webhooks
- Print the webhook URL to configure in your repo

### Stop Everything

```bash
./vigops.sh stop
```

### Other Commands

```bash
./vigops.sh status    # Check what's running
./vigops.sh restart   # Stop + start
```

---

## Manual Setup

If you prefer to run services individually:

### 1. Backend

```bash
cd backend
cp .env.example .env    # Edit .env to add your GitHub token
npm install
npm run dev
# Runs on http://localhost:4040
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. ngrok (for webhooks)

```bash
ngrok http 4040
# Copy the HTTPS URL for webhook setup
```

---

## GitHub Webhook Setup

1. Run VigOps (`./vigops.sh start`) — note the **webhook URL** printed in the terminal
2. Go to your GitHub repo → **Settings → Webhooks → Add webhook**
3. Configure:
   - **Payload URL**: `https://<your-ngrok-url>/webhook`
   - **Content type**: `application/json`
   - **Events**: Select **Pull requests**
4. Save — open or update a PR and watch the dashboard light up!

---

## Environment Variables

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

| Variable       | Default | Description                                          |
|---------------|---------|------------------------------------------------------|
| `GITHUB_TOKEN` | —       | GitHub PAT for higher API rate limits (60 → 5000/hr) |
| `PORT`         | `4040`  | Backend server port                                  |

> Get a token at: https://github.com/settings/tokens (select `repo` or `public_repo` scope)

---

## API Reference

| Method | Endpoint          | Description                          |
|--------|-------------------|--------------------------------------|
| POST   | `/webhook`        | GitHub PR event receiver             |
| GET    | `/analyze`        | Manual PR analysis (`?repo=&pr=`)    |
| GET    | `/analysis`       | Latest + full history of analyses    |
| GET    | `/health`         | Service health check                 |

---

## Test Without GitHub (curl)

```bash
curl -X POST http://localhost:4040/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -d '{
    "action": "opened",
    "pull_request": {
      "number": 1,
      "title": "feat: add k8s deployment config",
      "html_url": "https://github.com/org/repo/pull/1",
      "state": "open",
      "head": { "ref": "feature/infra-update" },
      "base": { "ref": "main" }
    },
    "repository": {
      "name": "my-repo",
      "full_name": "org/my-repo"
    },
    "sender": { "login": "devuser" }
  }'
```

---

## Project Structure

```
VigOps/
├── vigops.sh              # One-command start/stop script
├── backend/
│   ├── src/
│   │   ├── index.ts       # Express server entry point
│   │   ├── routes.ts      # Webhook + API endpoints
│   │   ├── analyzer.ts    # PR risk analysis engine
│   │   ├── fileAnalyzer.ts# Deep file-level analysis
│   │   ├── github.ts      # GitHub API client
│   │   ├── store.ts       # In-memory analysis storage
│   │   └── types.ts       # TypeScript interfaces
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx        # Main app layout + polling
│   │   ├── api.ts         # Backend API client
│   │   ├── types.ts       # Shared types
│   │   └── components/    # Dashboard UI components
│   └── package.json
└── README.md
```

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Node.js · TypeScript · Express          |
| Frontend   | React 19 · Vite · TypeScript · Tailwind |
| Networking | ngrok (webhook tunneling)               |
| Storage    | In-memory (no database required)        |

---

## Analysis Response Schema

```json
{
  "latest": {
    "id": "webhook-1776988476217-i32d3bg0k",
    "repo": "my-repo",
    "pr": 42,
    "prTitle": "feat: add autoscaling",
    "action": "opened",
    "sender": "devuser",
    "branchFrom": "feature/autoscaling",
    "branchTo": "main",
    "prUrl": "https://github.com/org/repo/pull/42",
    "riskLevel": "HIGH",
    "issues": [
      {
        "title": "Missing readiness probe",
        "description": "Kubernetes cannot determine if the pod is ready to serve traffic.",
        "severity": "MEDIUM"
      }
    ],
    "costImpact": "+₹3,000–₹8,000/month",
    "simulation": "System unstable under 5x traffic spike",
    "suggestions": ["Enable autoscaling", "Add health endpoints"],
    "analyzedFiles": [],
    "source": "webhook",
    "timestamp": "2026-04-22T16:00:00.000Z"
  },
  "total": 5,
  "history": []
}
```
