---
hide:
  - navigation
  - toc
---

<div class="hero" markdown>

# Nathan-Dash

<p class="subtitle">Ton dashboard tout-en-un pour gérer tes bots Discord</p>

[:material-rocket-launch: Installer maintenant](installation/one-liner.md){ .md-button .md-button--primary }
[:material-book-open-variant: Lire la doc](installation/index.md){ .md-button }

</div>

---

<div class="grid-cards" markdown>

<div class="card" markdown>
<span class="card-icon">:material-robot:</span>

### Gestion des bots

Ajoute, configure et surveille tous tes bots Discord depuis une seule interface. Token, préfixe, statut — tout est centralisé.
</div>

<div class="card" markdown>
<span class="card-icon">:material-monitor-dashboard:</span>

### Dashboard temps réel

Vue d'ensemble de tous tes bots en un coup d'oeil. Statut en ligne/hors ligne, stats, et infos serveur.
</div>

<div class="card" markdown>
<span class="card-icon">:material-text-box-search:</span>

### Logs & monitoring

Historique complet de toutes les actions. Filtre par bot, par niveau (info, warning, erreur), et analyse ce qui se passe.
</div>

<div class="card" markdown>
<span class="card-icon">:material-cellphone-link:</span>

### Responsive

Fonctionne sur mobile, tablette et desktop. Interface adaptative avec navigation par onglets (mobile) ou drawer (desktop).
</div>

<div class="card" markdown>
<span class="card-icon">:material-docker:</span>

### Déploiement Docker

Un seul script et c'est déployé. Build automatique, Nginx, health checks, et mise à jour toutes les 5 minutes.
</div>

<div class="card" markdown>
<span class="card-icon">:material-update:</span>

### Auto-update

Push sur `main` et ton serveur se met à jour tout seul. Pas besoin de toucher au serveur.
</div>

</div>

---

## Démarrage rapide

!!! tip "Installation en une commande"

    ```bash
    curl -fsSL https://raw.githubusercontent.com/Jefedi/Nathan-dash/main/install.sh | bash
    ```

    :material-arrow-right: [Guide complet d'installation](installation/one-liner.md)

---

## Architecture

```mermaid
graph LR
    A[Toi] -->|Push| B[GitHub main]
    B -->|Auto-pull 5min| C[Serveur]
    C -->|Docker build| D[Container Nginx]
    D -->|:3000| E[Nathan-Dash]
    E -->|Mobile/Desktop| F[Dashboard]
    F --> G[Bots]
    F --> H[Logs]
    F --> I[Settings]
```

---

## Stack technique

| Techno | Usage |
|---|---|
| **React Native** + Expo | Interface cross-platform |
| **TypeScript** | Typage fort |
| **Docker** + Nginx | Déploiement production |
| **Systemd** / Cron | Auto-update |
| **AsyncStorage** | Données persistantes |
