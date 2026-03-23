---
icon: material/rocket-launch
---

# Déploiement

Nathan-Dash est conçu pour être déployé facilement et se maintenir tout seul.

---

## Architecture

```mermaid
graph TB
    subgraph "GitHub"
        A[Repo GitHub<br>branche main]
    end

    subgraph "Ton serveur"
        B[deploy.sh]
        C[Docker build]
        D[Container Nginx]
        E["App :3000"]
    end

    subgraph "Auto-update"
        F[Systemd timer<br>ou Cron]
    end

    A -->|git pull| B
    B --> C
    C --> D
    D --> E
    F -->|Toutes les 5 min| B

    style A fill:#7c4dff,color:#fff
    style E fill:#ffab40,color:#000
    style F fill:#4caf50,color:#fff
```

---

## Guides

<div class="grid-cards" markdown>

<div class="card" markdown>
<span class="card-icon">:material-docker:</span>

### [Docker](docker.md)
Comment fonctionne le build Docker et le déploiement en container.
</div>

<div class="card" markdown>
<span class="card-icon">:material-update:</span>

### [Auto-update](auto-update.md)
Déploiement continu automatique à chaque push sur `main`.
</div>

<div class="card" markdown>
<span class="card-icon">:material-github:</span>

### [GitHub Pages](github-pages.md)
Comment cette documentation est déployée automatiquement.
</div>

</div>
