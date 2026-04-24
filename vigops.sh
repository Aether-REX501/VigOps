#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  VigOps — Start / Stop the full stack with one command
#
#  Usage:
#    ./vigops.sh start   — Install deps, launch backend + frontend + ngrok
#    ./vigops.sh stop    — Gracefully kill all services
#    ./vigops.sh status  — Show running services
#    ./vigops.sh restart — Stop then start
# ─────────────────────────────────────────────────────────────

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$ROOT_DIR/.vigops"
BACKEND_PORT=4040
FRONTEND_PORT=5173

# ── Colors ───────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

banner() {
  echo ""
  echo -e "${CYAN}${BOLD}"
  echo "  ╔═══════════════════════════════════════════╗"
  echo "  ║        ⚡ VigOps DevOps Platform          ║"
  echo "  ╚═══════════════════════════════════════════╝"
  echo -e "${NC}"
}

log()   { echo -e "  ${GREEN}✔${NC} $1"; }
warn()  { echo -e "  ${YELLOW}⚠${NC} $1"; }
err()   { echo -e "  ${RED}✖${NC} $1"; }
info()  { echo -e "  ${CYAN}→${NC} $1"; }

# ── Helpers ──────────────────────────────────────────────────
ensure_pid_dir() { mkdir -p "$PID_DIR"; }

save_pid() { echo "$2" > "$PID_DIR/$1.pid"; }

read_pid() {
  local file="$PID_DIR/$1.pid"
  if [[ -f "$file" ]]; then
    cat "$file"
  else
    echo ""
  fi
}

is_running() {
  local pid
  pid=$(read_pid "$1")
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

kill_service() {
  local name="$1"
  local pid
  pid=$(read_pid "$name")
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null
    # Also kill child processes
    pkill -P "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
    rm -f "$PID_DIR/$name.pid"
    log "Stopped ${BOLD}$name${NC} (PID $pid)"
  else
    rm -f "$PID_DIR/$name.pid"
  fi
}

wait_for_port() {
  local port=$1
  local name=$2
  local tries=0
  while ! ss -tlnp 2>/dev/null | grep -q ":${port} " && [[ $tries -lt 30 ]]; do
    sleep 0.5
    tries=$((tries + 1))
  done
  if ss -tlnp 2>/dev/null | grep -q ":${port} "; then
    return 0
  else
    return 1
  fi
}

# ── Start ────────────────────────────────────────────────────
do_start() {
  banner
  ensure_pid_dir

  # Check if already running
  if is_running backend && is_running frontend; then
    warn "VigOps is already running. Use ${BOLD}./vigops.sh restart${NC} to restart."
    do_status
    return 0
  fi

  # ── Install dependencies ────────────────────────────────
  info "Installing backend dependencies…"
  (cd "$ROOT_DIR/backend" && npm install --silent 2>&1) > /dev/null
  log "Backend dependencies ready"

  info "Installing frontend dependencies…"
  (cd "$ROOT_DIR/frontend" && npm install --silent 2>&1) > /dev/null
  log "Frontend dependencies ready"

  # ── Start Backend ───────────────────────────────────────
  info "Starting backend on port ${BOLD}$BACKEND_PORT${NC}…"
  (cd "$ROOT_DIR/backend" && npm run dev > "$PID_DIR/backend.log" 2>&1) &
  save_pid backend $!
  if wait_for_port $BACKEND_PORT "backend"; then
    log "Backend running → ${BOLD}http://localhost:${BACKEND_PORT}${NC}"
  else
    warn "Backend may still be starting — check ${BOLD}.vigops/backend.log${NC}"
  fi

  # ── Start Frontend ──────────────────────────────────────
  info "Starting frontend on port ${BOLD}$FRONTEND_PORT${NC}…"
  (cd "$ROOT_DIR/frontend" && npm run dev > "$PID_DIR/frontend.log" 2>&1) &
  save_pid frontend $!
  if wait_for_port $FRONTEND_PORT "frontend"; then
    log "Frontend running → ${BOLD}http://localhost:${FRONTEND_PORT}${NC}"
  else
    warn "Frontend may still be starting — check ${BOLD}.vigops/frontend.log${NC}"
  fi

  # ── Start ngrok ─────────────────────────────────────────
  if command -v ngrok &>/dev/null; then
    info "Starting ngrok tunnel → localhost:${BOLD}$BACKEND_PORT${NC}…"
    ngrok http "$BACKEND_PORT" --log=stdout > "$PID_DIR/ngrok.log" 2>&1 &
    save_pid ngrok $!
    sleep 3

    # Try to read the public URL from ngrok API
    # ngrok's inspect UI may bind to 4041 if 4040 is taken
    local ngrok_url=""
    for api_port in 4041 4042 4043; do
      ngrok_url=$(curl -s "http://localhost:${api_port}/api/tunnels" 2>/dev/null \
        | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['tunnels'][0]['public_url'])" 2>/dev/null || true)
      if [[ -n "$ngrok_url" ]]; then
        echo "$ngrok_url" > "$PID_DIR/ngrok_url.txt"
        echo "$api_port" > "$PID_DIR/ngrok_api_port.txt"
        break
      fi
    done

    if [[ -n "$ngrok_url" ]]; then
      log "ngrok tunnel  → ${BOLD}${ngrok_url}${NC}"
      echo ""
      echo -e "  ${CYAN}${BOLD}Webhook URL:${NC} ${ngrok_url}/webhook"
    else
      warn "ngrok started but could not detect public URL — check ${BOLD}.vigops/ngrok.log${NC}"
    fi
  else
    warn "ngrok not installed — skipping tunnel. Webhooks will only work on localhost."
    echo "  Install ngrok: https://ngrok.com/download"
  fi

  # ── Summary ─────────────────────────────────────────────
  echo ""
  echo -e "  ${GREEN}${BOLD}━━━ VigOps is running! ━━━${NC}"
  echo ""
  echo -e "  ${BOLD}Dashboard${NC}  → http://localhost:${FRONTEND_PORT}"
  echo -e "  ${BOLD}Backend${NC}    → http://localhost:${BACKEND_PORT}"
  echo -e "  ${BOLD}Health${NC}     → http://localhost:${BACKEND_PORT}/health"
  if [[ -f "$PID_DIR/ngrok_url.txt" ]]; then
    echo -e "  ${BOLD}Webhook${NC}    → $(cat "$PID_DIR/ngrok_url.txt")/webhook"
  fi
  echo ""
  echo -e "  Stop with: ${BOLD}./vigops.sh stop${NC}"
  echo ""
}

# ── Stop ─────────────────────────────────────────────────────
do_stop() {
  banner
  ensure_pid_dir
  info "Stopping VigOps services…"
  echo ""

  kill_service ngrok
  kill_service frontend
  kill_service backend

  # Clean up any orphan processes on our ports
  local pids
  pids=$(lsof -ti :$BACKEND_PORT 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill 2>/dev/null || true
    log "Cleaned up orphan processes on port $BACKEND_PORT"
  fi
  pids=$(lsof -ti :$FRONTEND_PORT 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill 2>/dev/null || true
    log "Cleaned up orphan processes on port $FRONTEND_PORT"
  fi

  rm -f "$PID_DIR"/*.pid "$PID_DIR"/ngrok_url.txt "$PID_DIR"/ngrok_api_port.txt

  echo ""
  log "${BOLD}All services stopped.${NC}"
  echo ""
}

# ── Status ───────────────────────────────────────────────────
do_status() {
  ensure_pid_dir
  echo ""
  echo -e "  ${BOLD}Service       Status          URL${NC}"
  echo "  ──────────  ──────────────  ──────────────────────────────"

  if is_running backend; then
    echo -e "  Backend     ${GREEN}● running${NC}       http://localhost:${BACKEND_PORT}"
  else
    echo -e "  Backend     ${RED}○ stopped${NC}"
  fi

  if is_running frontend; then
    echo -e "  Frontend    ${GREEN}● running${NC}       http://localhost:${FRONTEND_PORT}"
  else
    echo -e "  Frontend    ${RED}○ stopped${NC}"
  fi

  if is_running ngrok; then
    local url="—"
    [[ -f "$PID_DIR/ngrok_url.txt" ]] && url="$(cat "$PID_DIR/ngrok_url.txt")/webhook"
    echo -e "  ngrok       ${GREEN}● running${NC}       ${url}"
  else
    echo -e "  ngrok       ${RED}○ stopped${NC}"
  fi

  echo ""
}

# ── Main ─────────────────────────────────────────────────────
case "${1:-help}" in
  start)   do_start   ;;
  stop)    do_stop    ;;
  restart) do_stop; do_start ;;
  status)  banner; do_status ;;
  *)
    banner
    echo "  Usage: ./vigops.sh {start|stop|restart|status}"
    echo ""
    echo "  Commands:"
    echo "    start    Install deps & launch backend, frontend, ngrok"
    echo "    stop     Gracefully stop all services"
    echo "    restart  Stop then start"
    echo "    status   Show running services"
    echo ""
    ;;
esac
