---
icon: material/wrench
---

# Installation manuelle

Ce guide détaille chaque étape pour ceux qui veulent **comprendre et contrôler** le processus.

---

## 1. Cloner le repo

```bash
git clone https://github.com/Jefedi/Nathan-dash.git
cd Nathan-dash
```

---

## 2. Build avec Docker

```bash
# Construire l'image
docker compose build

# Vérifier que l'image est créée
docker images | grep nathan-dash
```

!!! info "Ce que fait le build"

    Le `Dockerfile` utilise un **multi-stage build** :

    1. **Stage 1 — Builder** : Node 22 Alpine installe les dépendances et exécute `npx expo export --platform web`
    2. **Stage 2 — Runtime** : Nginx Alpine sert les fichiers statiques avec compression gzip et cache

---

## 3. Lancer l'application

```bash
# Démarrer en arrière-plan
docker compose up -d

# Vérifier que ça tourne
docker compose ps
```

Tu devrais voir :

```
NAME                STATUS              PORTS
nathan-dash-app-1   Up (healthy)       0.0.0.0:3000->80/tcp
```

:material-arrow-right: Ouvre **http://localhost:3000**

---

## 4. Configurer l'auto-update (optionnel)

### Option A : Systemd (Linux)

```bash
# Créer le service
sudo tee /etc/systemd/system/nathan-dash-updater.service << 'EOF'
[Unit]
Description=Nathan-Dash Auto-Updater
After=network-online.target docker.service

[Service]
Type=oneshot
WorkingDirectory=/home/ton_user/Nathan-dash
ExecStart=/home/ton_user/Nathan-dash/deploy.sh
User=ton_user

[Install]
WantedBy=multi-user.target
EOF

# Créer le timer (toutes les 5 min)
sudo tee /etc/systemd/system/nathan-dash-updater.timer << 'EOF'
[Unit]
Description=Vérifie les mises à jour Nathan-Dash

[Timer]
OnBootSec=60
OnUnitActiveSec=300
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Activer
sudo systemctl daemon-reload
sudo systemctl enable --now nathan-dash-updater.timer
```

### Option B : Cron (macOS / Linux sans systemd)

```bash
# Ajouter au crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * cd ~/Nathan-dash && ./deploy.sh >> deploy.log 2>&1") | crontab -
```

---

## 5. Vérification finale

- [x] `docker compose ps` montre le container "Up (healthy)"
- [ ] `http://localhost:3000` affiche le dashboard
- [ ] L'auto-update est configuré (`systemctl status nathan-dash-updater.timer`)

!!! success "C'est prêt !"

    Ton dashboard est en ligne et se mettra à jour automatiquement à chaque push sur `main`.
