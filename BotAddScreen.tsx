---
icon: material/robot
---

# Gestion des bots

C'est ici que tu gères tous tes bots Discord : ajout, modification, suppression et suivi.

---

## Ajouter un bot

<div class="steps" markdown>

<div class="step" data-step="1" markdown>

#### Ouvre l'onglet "Bots"

Clique sur l'icône :material-robot: dans la navigation.

</div>

<div class="step" data-step="2" markdown>

#### Clique sur "Ajouter un bot"

Le bouton se trouve en haut de l'écran.

</div>

<div class="step" data-step="3" markdown>

#### Remplis les informations

| Champ | Description | Exemple |
|---|---|---|
| **Nom** | Le nom de ton bot | `MusicBot` |
| **Token** | Le token Discord du bot | `MTIz...` |
| **Préfixe** | Le préfixe des commandes | `!` |
| **Avatar URL** | URL de l'avatar (optionnel) | `https://...` |
| **Server ID** | ID du serveur (optionnel) | `123456789` |

</div>

<div class="step" data-step="4" markdown>

#### Valide

Le bot apparaît dans ta liste avec le statut "Offline" par défaut.

</div>

</div>

---

## Modifier un bot

1. Clique sur le bot dans la liste
2. Modifie les champs souhaités
3. Sauvegarde

!!! info "Les données sont persistantes"

    Toutes les modifications sont sauvegardées localement via **AsyncStorage**. Elles survivent aux rechargements de page et aux redémarrages.

---

## Supprimer un bot

1. Ouvre les détails du bot
2. Clique sur **Supprimer**
3. Confirme la suppression

!!! warning "Action irréversible"

    La suppression d'un bot supprime aussi tous ses logs associés.

---

## Obtenir un token Discord

Si tu ne sais pas où trouver le token de ton bot :

<div class="steps" markdown>

<div class="step" data-step="1" markdown>

Va sur le [Discord Developer Portal](https://discord.com/developers/applications)

</div>

<div class="step" data-step="2" markdown>

Sélectionne ton application (ou crée-en une nouvelle)

</div>

<div class="step" data-step="3" markdown>

Va dans **Bot** → clique sur **Reset Token** → copie le token

</div>

</div>

!!! danger "Sécurité"

    - Ne partage **jamais** ton token de bot
    - Si ton token est compromis, **reset-le immédiatement** sur le Developer Portal
    - Nathan-Dash stocke les tokens **localement** sur ton appareil uniquement
