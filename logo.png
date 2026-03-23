# Déploiement

## Installation one-liner

```bash
curl -fsSL https://raw.githubusercontent.com/Jefedi/Nathan-dash/main/install.sh | bash
```

Le script fait **tout automatiquement** :
1. Installe Git, Docker, Docker Compose si manquants
2. Clone le repo
3. Build l'image Docker
4. Lance l'app sur `http://localhost:3000`
5. Configure l'auto-update (systemd ou cron, toutes les 5 min)

## Prérequis (installés automatiquement par le script)

- Docker (20.10+)
- Docker Compose (v2+)
- Git

## Architecture du déploiement

```
┌─────────────┐      ┌──────────────────┐
│   GitHub     │ pull │   Serveur        │
│   (main)     │─────→│                  │
│              │      │  deploy.sh       │
└─────────────┘      │    │             │
                     │    ▼             │
                     │  Docker build    │
                     │    │             │
                     │    ▼             │
                     │  ┌────────────┐  │
                     │  │  Nginx     │  │
                     │  │  :3000     │  │
                     │  │  (SPA)     │  │
                     │  └────────────┘  │
                     └──────────────────┘
```

## Fichiers de déploiement

| Fichier | Rôle |
|---|---|
| `Dockerfile` | Build multi-stage : Node (compile) → Nginx (sert) |
| `docker-compose.yml` | Orchestration du conteneur |
| `nginx.conf` | Config Nginx optimisée pour SPA |
| `deploy.sh` | Script d'auto-update et redéploiement |
| `.dockerignore` | Fichiers exclus du build Docker |

## Utilisation

### Déploiement simple

```bash
# Déploie une fois (pull + build + run)
./deploy.sh
```

Le script :
1. Pull les dernières modifications de `main`
2. Compare les commits local vs remote
3. Si changements détectés → rebuild l'image Docker
4. Arrête l'ancien conteneur
5. Démarre le nouveau
6. Vérifie que l'app est accessible

### Mode surveillance (auto-redéploiement)

```bash
# Vérifie toutes les 60 secondes
./deploy.sh --watch

# Vérifie toutes les 2 minutes
./deploy.sh --watch 120
```

Le script tourne en boucle, vérifie les nouveaux commits sur `main`, et redéploie automatiquement si des changements sont détectés.

### Logs

Les logs de déploiement sont écrits dans `deploy.log` à la racine du projet.

## Docker

### Build manuel

```bash
docker compose build
docker compose up -d
```

### Voir les logs du conteneur

```bash
docker compose logs -f
```

### Arrêter

```bash
docker compose down
```

## Workflow de mise à jour

```
1. Push sur main
2. deploy.sh détecte le nouveau commit
3. git pull
4. docker compose build --no-cache
5. docker compose down
6. docker compose up -d
7. Healthcheck → App en ligne sur :3000
```

## Port

L'app est accessible sur **http://localhost:3000** par défaut. Pour changer le port, modifier `docker-compose.yml` :

```yaml
ports:
  - "8080:80"  # Changer 3000 par le port voulu
```
