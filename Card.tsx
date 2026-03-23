---
icon: material/checkbox-marked-circle
---

# Prérequis

Avant d'installer Nathan-Dash, assure-toi d'avoir ces éléments.

---

## Matériel requis

!!! info "Serveur / VPS / PC"

    Nathan-Dash tourne sur n'importe quelle machine avec :

    - **OS** : Linux (Ubuntu, Debian, CentOS), macOS, ou Windows (avec WSL2)
    - **RAM** : 512 Mo minimum (1 Go recommandé)
    - **Disque** : 1 Go d'espace libre
    - **Réseau** : Accès internet pour cloner et pull les mises à jour

---

## Logiciels requis

!!! tip "Installation automatique"

    Si tu utilises le [script one-liner](one-liner.md), **tout est installé automatiquement** ! Tu peux passer directement à la suite.

### 1. Git

=== "Ubuntu / Debian"

    ```bash
    sudo apt-get update && sudo apt-get install -y git
    ```

=== "CentOS / RHEL"

    ```bash
    sudo yum install -y git
    ```

=== "macOS"

    ```bash
    brew install git
    ```

=== "Windows"

    Télécharge Git depuis [git-scm.com](https://git-scm.com/download/win)

Vérifie l'installation :

```bash
git --version
# git version 2.x.x ✓
```

### 2. Docker

=== "Linux (toutes distros)"

    ```bash
    curl -fsSL https://get.docker.com | sh
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    ```

    !!! warning "Déconnexion requise"

        Après `usermod`, **déconnecte-toi et reconnecte-toi** pour que les permissions prennent effet.

=== "macOS"

    Installe [Docker Desktop](https://www.docker.com/products/docker-desktop/) puis lance-le.

=== "Windows"

    Installe [Docker Desktop](https://www.docker.com/products/docker-desktop/) avec le backend WSL2.

Vérifie :

```bash
docker --version
# Docker version 24.x.x ✓
```

### 3. Docker Compose

Docker Compose est inclus dans Docker Desktop (macOS/Windows). Sur Linux :

```bash
# Vérifier s'il est déjà installé
docker compose version

# Si non, installer le plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
COMPOSE_VERSION=$(curl -fsSL https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
sudo curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

---

## Checklist

- [x] Serveur / VPS / PC avec Linux, macOS ou Windows
- [ ] Git installé
- [ ] Docker installé et démarré
- [ ] Docker Compose disponible

!!! success "Prêt ?"

    :material-arrow-right: Passe à l'[installation rapide](one-liner.md) ou à l'[installation manuelle](manuelle.md)
