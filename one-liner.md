---
icon: material/github
---

# GitHub Pages

Cette documentation est automatiquement déployée sur **GitHub Pages** à chaque push sur `main`.

---

## URL de la doc

:material-web: **https://jefedi.github.io/Nathan-dash/**

---

## Comment ça marche

```mermaid
graph LR
    A[Push sur main] --> B[GitHub Actions]
    B --> C[mkdocs build]
    C --> D[Deploy gh-pages]
    D --> E[jefedi.github.io/Nathan-dash]

    style A fill:#7c4dff,color:#fff
    style E fill:#ffab40,color:#000
```

Le workflow GitHub Actions :

1. Se déclenche à chaque push sur `main`
2. Installe Python + MkDocs Material
3. Build la doc (`mkdocs build`)
4. Publie sur la branche `gh-pages`

---

## Activer GitHub Pages

!!! info "Première fois uniquement"

    Après le premier push, il faut activer GitHub Pages dans les settings du repo :

<div class="steps" markdown>

<div class="step" data-step="1" markdown>

Va dans **Settings** → **Pages** sur ton repo GitHub

</div>

<div class="step" data-step="2" markdown>

Dans **Source**, sélectionne **GitHub Actions**

</div>

<div class="step" data-step="3" markdown>

La doc sera accessible à `https://jefedi.github.io/Nathan-dash/` après le prochain push

</div>

</div>

---

## Modifier la documentation

Les fichiers de doc sont dans le dossier `docs/` :

```
docs/
├── index.md                    # Page d'accueil
├── installation/
│   ├── index.md               # Guide d'installation
│   ├── prerequis.md           # Prérequis
│   ├── one-liner.md           # Installation rapide
│   ├── manuelle.md            # Installation manuelle
│   └── configuration.md      # Configuration
├── utilisation/
│   ├── index.md               # Guide d'utilisation
│   ├── dashboard.md           # Dashboard
│   ├── bots.md                # Gestion des bots
│   └── logs.md                # Logs & monitoring
├── deploiement/
│   ├── index.md               # Déploiement
│   ├── docker.md              # Docker
│   ├── auto-update.md         # Auto-update
│   └── github-pages.md        # Cette page
├── faq.md                     # FAQ
├── assets/                    # Images et logos
└── stylesheets/
    └── extra.css              # CSS personnalisé
```

Pour modifier une page, édite le fichier `.md` correspondant et push sur `main`. La doc se met à jour en ~2 minutes.

---

## Prévisualisation locale

Pour voir la doc en local avant de push :

```bash
# Installer MkDocs Material
pip install mkdocs-material mkdocs-minify-plugin

# Serveur de dev avec live reload
mkdocs serve

# Ouvre http://localhost:8000
```
