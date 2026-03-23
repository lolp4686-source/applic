#!/usr/bin/env bash
# ============================================================
# deploy.sh — Script de déploiement automatique
#
# Usage:
#   ./deploy.sh              → Pull main + rebuild + redéploie
#   ./deploy.sh --watch      → Mode surveillance (toutes les 60s)
#   ./deploy.sh --watch 120  → Mode surveillance (toutes les 120s)
# ============================================================

set -euo pipefail

APP_NAME="nathan-dash"
BRANCH="main"
COMPOSE_FILE="docker-compose.yml"
LOG_FILE="deploy.log"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${BLUE}[$timestamp]${NC} $1"
  echo "[$timestamp] $1" >> "$LOG_FILE"
}

error() {
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${RED}[$timestamp] ERREUR: $1${NC}"
  echo "[$timestamp] ERREUR: $1" >> "$LOG_FILE"
}

success() {
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${GREEN}[$timestamp] $1${NC}"
  echo "[$timestamp] $1" >> "$LOG_FILE"
}

# ----------------------------------------------------------
# Vérifie les prérequis
# ----------------------------------------------------------
check_deps() {
  for cmd in git docker; do
    if ! command -v "$cmd" &> /dev/null; then
      error "$cmd n'est pas installé"
      exit 1
    fi
  done

  # docker compose (plugin) ou docker-compose (standalone)
  if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
  elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
  else
    error "docker compose n'est pas installé"
    exit 1
  fi
}

# ----------------------------------------------------------
# Pull les dernières modifications de main
# ----------------------------------------------------------
pull_updates() {
  log "Récupération des mises à jour depuis ${BRANCH}..."

  git fetch origin "$BRANCH" 2>> "$LOG_FILE"

  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse "origin/$BRANCH")

  if [ "$LOCAL" = "$REMOTE" ]; then
    log "Déjà à jour (${LOCAL:0:8})"
    return 1  # Pas de mise à jour
  fi

  log "Nouvelles modifications détectées (${LOCAL:0:8} → ${REMOTE:0:8})"
  git pull origin "$BRANCH" 2>> "$LOG_FILE"

  # Afficher les changements
  log "Modifications :"
  git log --oneline "${LOCAL}..${REMOTE}" 2>> "$LOG_FILE" | while read -r line; do
    log "  $line"
  done

  return 0  # Mises à jour disponibles
}

# ----------------------------------------------------------
# Rebuild et redéploie le conteneur Docker
# ----------------------------------------------------------
rebuild_and_deploy() {
  log "Build de l'image Docker..."
  $COMPOSE_CMD -f "$COMPOSE_FILE" build --no-cache 2>> "$LOG_FILE"

  log "Arrêt du conteneur actuel..."
  $COMPOSE_CMD -f "$COMPOSE_FILE" down 2>> "$LOG_FILE" || true

  log "Démarrage du nouveau conteneur..."
  $COMPOSE_CMD -f "$COMPOSE_FILE" up -d 2>> "$LOG_FILE"

  # Attendre que le healthcheck passe
  log "Vérification du déploiement..."
  local retries=10
  while [ $retries -gt 0 ]; do
    if $COMPOSE_CMD -f "$COMPOSE_FILE" ps | grep -q "healthy\|running"; then
      success "Déploiement réussi ! App accessible sur http://localhost:3000"
      return 0
    fi
    retries=$((retries - 1))
    sleep 3
  done

  error "Le conteneur ne semble pas démarrer correctement"
  $COMPOSE_CMD -f "$COMPOSE_FILE" logs --tail=20
  return 1
}

# ----------------------------------------------------------
# Déploiement unique
# ----------------------------------------------------------
deploy_once() {
  log "=== Déploiement de ${APP_NAME} ==="

  # S'assurer qu'on est sur la bonne branche
  CURRENT_BRANCH=$(git branch --show-current)
  if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    log "Switch vers la branche ${BRANCH}..."
    git checkout "$BRANCH" 2>> "$LOG_FILE"
  fi

  if pull_updates; then
    rebuild_and_deploy
  else
    # Premier déploiement ou force rebuild
    if ! $COMPOSE_CMD -f "$COMPOSE_FILE" ps 2>/dev/null | grep -q "running"; then
      log "Aucun conteneur actif, lancement du build initial..."
      rebuild_and_deploy
    fi
  fi
}

# ----------------------------------------------------------
# Mode surveillance continue
# ----------------------------------------------------------
watch_mode() {
  local interval="${1:-60}"
  log "=== Mode surveillance activé (intervalle: ${interval}s) ==="
  log "Appuyez sur Ctrl+C pour arrêter"

  while true; do
    deploy_once
    echo ""
    log "Prochaine vérification dans ${interval}s..."
    sleep "$interval"
  done
}

# ----------------------------------------------------------
# Main
# ----------------------------------------------------------
check_deps

case "${1:-}" in
  --watch)
    watch_mode "${2:-60}"
    ;;
  --help|-h)
    echo "Usage:"
    echo "  ./deploy.sh              Déploie les dernières mises à jour"
    echo "  ./deploy.sh --watch      Surveille et redéploie (toutes les 60s)"
    echo "  ./deploy.sh --watch 120  Surveille et redéploie (toutes les 120s)"
    echo "  ./deploy.sh --help       Affiche cette aide"
    ;;
  *)
    deploy_once
    ;;
esac
