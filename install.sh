#!/usr/bin/env bash
# ============================================================
# install.sh — Installation 100% automatique de Nathan-Dash
#
# Usage (one-liner) :
#   curl -fsSL https://raw.githubusercontent.com/Jefedi/Nathan-dash/main/install.sh | bash
# ============================================================

set -euo pipefail

# ---------------------- Config ----------------------
GITHUB_USER="Jefedi"
GITHUB_REPO="Nathan-dash"
REPO_URL="https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git"
INSTALL_DIR="$HOME/Nathan-dash"
APP_PORT=3000
BRANCH="main"

# ---------------------- Couleurs ----------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ---------------------- Helpers ----------------------
step=0
total_steps=6

progress() {
  step=$((step + 1))
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  [$step/$total_steps] $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

ok()    { echo -e "  ${GREEN}✓${NC} $1"; }
warn()  { echo -e "  ${YELLOW}!${NC} $1"; }
fail()  { echo -e "  ${RED}✗ $1${NC}"; exit 1; }

# ---------------------- Banner ----------------------
echo ""
echo -e "${BLUE}${BOLD}"
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║                                               ║"
echo "  ║        Nathan-Dash — Installation auto        ║"
echo "  ║        Discord Bot Manager                    ║"
echo "  ║                                               ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================
# 1. Vérification des prérequis
# ============================================================
progress "Vérification des prérequis"

# Git
if command -v git &> /dev/null; then
  ok "Git $(git --version | cut -d' ' -f3)"
else
  warn "Git non trouvé — installation..."
  if command -v apt-get &> /dev/null; then
    sudo apt-get update -qq && sudo apt-get install -y -qq git
  elif command -v yum &> /dev/null; then
    sudo yum install -y -q git
  elif command -v brew &> /dev/null; then
    brew install git
  elif command -v pacman &> /dev/null; then
    sudo pacman -S --noconfirm git
  else
    fail "Impossible d'installer Git automatiquement. Installez-le manuellement."
  fi
  ok "Git installé"
fi

# Docker
if command -v docker &> /dev/null; then
  ok "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
else
  warn "Docker non trouvé — installation..."
  if [[ "$(uname)" == "Linux" ]]; then
    curl -fsSL https://get.docker.com | sh
    sudo systemctl enable docker
    sudo systemctl start docker
    # Ajouter l'utilisateur au groupe docker
    sudo usermod -aG docker "$USER" 2>/dev/null || true
    ok "Docker installé (re-login peut être nécessaire pour les permissions)"
  elif [[ "$(uname)" == "Darwin" ]]; then
    if command -v brew &> /dev/null; then
      brew install --cask docker
      ok "Docker Desktop installé — lancez-le depuis Applications"
    else
      fail "Installez Docker Desktop depuis https://docker.com/products/docker-desktop"
    fi
  else
    fail "Installez Docker depuis https://docs.docker.com/get-docker/"
  fi
fi

# Docker Compose
if docker compose version &> /dev/null 2>&1; then
  ok "Docker Compose (plugin)"
  COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
  ok "Docker Compose (standalone)"
  COMPOSE_CMD="docker-compose"
else
  warn "Docker Compose non trouvé — installation du plugin..."
  if [[ "$(uname)" == "Linux" ]]; then
    sudo mkdir -p /usr/local/lib/docker/cli-plugins
    COMPOSE_VERSION=$(curl -fsSL https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
    sudo curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
      -o /usr/local/lib/docker/cli-plugins/docker-compose
    sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    ok "Docker Compose installé"
    COMPOSE_CMD="docker compose"
  else
    fail "Installez Docker Compose : https://docs.docker.com/compose/install/"
  fi
fi

# ============================================================
# 2. Cloner le projet
# ============================================================
progress "Récupération du projet"

if [ -d "$INSTALL_DIR/.git" ]; then
  warn "Le projet existe déjà dans $INSTALL_DIR"
  cd "$INSTALL_DIR"
  git remote set-url origin "$REPO_URL"
  git fetch origin "$BRANCH" 2>/dev/null
  git checkout "$BRANCH" 2>/dev/null
  git pull origin "$BRANCH" 2>/dev/null
  ok "Projet mis à jour"
else
  git clone "$REPO_URL" "$INSTALL_DIR" 2>/dev/null
  cd "$INSTALL_DIR"
  git checkout "$BRANCH" 2>/dev/null || true
  ok "Projet cloné dans $INSTALL_DIR"
fi

# ============================================================
# 3. Build Docker
# ============================================================
progress "Build de l'image Docker"

$COMPOSE_CMD build --no-cache 2>&1 | tail -5
ok "Image construite"

# ============================================================
# 4. Lancement
# ============================================================
progress "Démarrage de l'application"

$COMPOSE_CMD down 2>/dev/null || true
$COMPOSE_CMD up -d 2>&1
ok "Conteneur démarré"

# Attendre que ce soit prêt
echo -n "  Vérification"
ready=false
for i in $(seq 1 15); do
  if curl -fsSo /dev/null "http://localhost:$APP_PORT" 2>/dev/null; then
    ready=true
    break
  fi
  echo -n "."
  sleep 2
done
echo ""

if $ready; then
  ok "Application accessible"
else
  warn "L'app démarre... vérifiez dans quelques secondes"
fi

# ============================================================
# 5. Installer le service d'auto-update (systemd)
# ============================================================
progress "Configuration de l'auto-update"

SERVICE_FILE="/etc/systemd/system/nathan-dash-updater.service"
TIMER_FILE="/etc/systemd/system/nathan-dash-updater.timer"

if [[ "$(uname)" == "Linux" ]] && command -v systemctl &> /dev/null; then
  # Service
  sudo tee "$SERVICE_FILE" > /dev/null << UNIT
[Unit]
Description=Nathan-Dash Auto-Updater
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=oneshot
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/deploy.sh
User=$USER

[Install]
WantedBy=multi-user.target
UNIT

  # Timer (toutes les 5 minutes)
  sudo tee "$TIMER_FILE" > /dev/null << UNIT
[Unit]
Description=Vérifie les mises à jour Nathan-Dash toutes les 5 min

[Timer]
OnBootSec=60
OnUnitActiveSec=300
Persistent=true

[Install]
WantedBy=timers.target
UNIT

  sudo systemctl daemon-reload
  sudo systemctl enable nathan-dash-updater.timer 2>/dev/null
  sudo systemctl start nathan-dash-updater.timer 2>/dev/null
  ok "Auto-update activé (vérifie toutes les 5 min via systemd)"
  ok "Gérer : sudo systemctl status nathan-dash-updater.timer"
else
  # Fallback : crontab pour macOS ou Linux sans systemd
  CRON_CMD="*/5 * * * * cd $INSTALL_DIR && ./deploy.sh >> $INSTALL_DIR/deploy.log 2>&1"
  (crontab -l 2>/dev/null | grep -v "Nathan-dash"; echo "$CRON_CMD") | crontab -
  ok "Auto-update activé via cron (toutes les 5 min)"
fi

# ============================================================
# 6. Résumé
# ============================================================
progress "Installation terminée"

echo ""
echo -e "${GREEN}${BOLD}"
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║                                               ║"
echo "  ║   Nathan-Dash est installé et en ligne !      ║"
echo "  ║                                               ║"
echo -e "  ║   ${NC}${GREEN}URL : http://localhost:$APP_PORT${BOLD}                 ║"
echo "  ║                                               ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "  ${BOLD}Commandes utiles :${NC}"
echo ""
echo -e "  ${CYAN}Voir les logs de l'app :${NC}"
echo "    cd $INSTALL_DIR && docker compose logs -f"
echo ""
echo -e "  ${CYAN}Redéployer manuellement :${NC}"
echo "    cd $INSTALL_DIR && ./deploy.sh"
echo ""
echo -e "  ${CYAN}Arrêter l'app :${NC}"
echo "    cd $INSTALL_DIR && docker compose down"
echo ""
echo -e "  ${CYAN}Voir les logs de déploiement :${NC}"
echo "    cat $INSTALL_DIR/deploy.log"
echo ""
echo -e "  ${CYAN}Désinstaller :${NC}"
echo "    cd $INSTALL_DIR && docker compose down"
echo "    sudo systemctl disable nathan-dash-updater.timer 2>/dev/null"
echo "    rm -rf $INSTALL_DIR"
echo ""
