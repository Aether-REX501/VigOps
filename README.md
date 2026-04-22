# VigOps — DevOps Intelligence Platform

Real-time GitHub PR analysis dashboard. Receives webhook events → generates risk/cost/simulation analysis → displays live on the dashboard.

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## GitHub Webhook Setup (with ngrok)

1. Install ngrok: https://ngrok.com/download  
2. Expose the backend:
   ```bash
   ngrok http 4000
   ```
3. Copy the HTTPS URL (e.g. `https://abc123.ngrok.io`)
4. In your GitHub repo → **Settings → Webhooks → Add webhook**:
   - **Payload URL**: `https://abc123.ngrok.io/webhook`
   - **Content type**: `application/json`
   - **Events**: Select **Pull requests**
5. Open or create a PR in your repo → watch the dashboard update live!

---

## API Reference

| Method | Endpoint    | Description                        |
|--------|-------------|------------------------------------|
| POST   | `/webhook`  | GitHub PR event receiver           |
| GET    | `/analysis` | Latest + history of PR analyses    |
| GET    | `/health`   | Service health check               |

---

## Analysis Response Schema

```json
{
  "latest": {
    "repo": "my-repo",
    "pr": 42,
    "prTitle": "feat: add autoscaling",
    "action": "opened",
    "riskLevel": "HIGH",
    "issues": ["Missing readiness probe", "..."],
    "costImpact": "+₹3,000–₹8,000/month",
    "simulation": "System unstable under 5x traffic spike",
    "suggestions": ["Enable autoscaling", "..."],
    "timestamp": "2026-04-22T16:00:00.000Z"
  },
  "total": 5,
  "history": [...]
}
```

---

## Test Without GitHub (curl)

```bash
curl -X POST http://localhost:4000/webhook \
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

## Stack

- **Backend**: Node.js · TypeScript · Express  
- **Frontend**: React · Vite · TypeScript · Axios  
- **Storage**: In-memory (no database required)
