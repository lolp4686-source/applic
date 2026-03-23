---
icon: material/cog
---

# Configuration

Nathan-Dash est conçu pour fonctionner **sans configuration** dès l'installation. Mais voici comment personnaliser certains paramètres.

---

## Port de l'application

Par défaut, l'app tourne sur le port **3000**. Pour changer :

=== "docker-compose.yml"

    ```yaml title="docker-compose.yml" hl_lines="4"
    services:
      app:
        ports:
          - "8080:80"  # (1)!
    ```

    1. Remplace `3000` par le port souhaité (ici `8080`)

=== "Appliquer"

    ```bash
    docker compose down
    docker compose up -d
    ```

---

## Fréquence d'auto-update

Par défaut, le serveur vérifie les mises à jour **toutes les 5 minutes**.

=== "Systemd"

    ```bash
    sudo systemctl edit nathan-dash-updater.timer
    ```

    ```ini
    [Timer]
    OnUnitActiveSec=600  # (1)!
    ```

    1. Valeur en secondes. 600 = 10 minutes

    ```bash
    sudo systemctl daemon-reload
    ```

=== "Cron"

    ```bash
    crontab -e
    ```

    ```
    */10 * * * * cd ~/Nathan-dash && ./deploy.sh >> deploy.log 2>&1
    ```

    Change `*/5` en `*/10` pour 10 minutes, `*/30` pour 30 minutes, etc.

---

## Nginx (avancé)

La configuration Nginx se trouve dans `nginx.conf` à la racine du projet.

```nginx title="nginx.conf"
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Compression gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Cache des assets statiques
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

!!! tip "Après modification"

    Rebuild et redéploie :
    ```bash
    docker compose build && docker compose up -d
    ```

---

## HTTPS avec un reverse proxy

Pour accéder en HTTPS, utilise un reverse proxy comme **Caddy** (le plus simple) ou Nginx.

=== "Caddy (recommandé)"

    ```bash
    # Installer Caddy
    sudo apt install -y caddy
    ```

    ```title="/etc/caddy/Caddyfile"
    ton-domaine.com {
        reverse_proxy localhost:3000
    }
    ```

    ```bash
    sudo systemctl restart caddy
    ```

    Caddy gère automatiquement les certificats SSL via Let's Encrypt.

=== "Nginx"

    ```nginx title="/etc/nginx/sites-available/nathan-dash"
    server {
        listen 80;
        server_name ton-domaine.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```

    Puis utilise **Certbot** pour le SSL :
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d ton-domaine.com
    ```
