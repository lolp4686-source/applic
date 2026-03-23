---
icon: material/text-box-search
---

# Logs & monitoring

Les logs te permettent de suivre tout ce qui se passe avec tes bots en temps réel.

---

## Vue d'ensemble

L'écran des logs affiche un **historique chronologique** de toutes les actions :

- Ajout, modification, suppression de bots
- Changements de statut
- Erreurs et avertissements
- Actions utilisateur

---

## Niveaux de log

Chaque entrée a un niveau de sévérité :

| Niveau | Icône | Usage |
|---|---|---|
| **Info** | :material-information: | Actions normales (bot ajouté, modifié...) |
| **Success** | :material-check-circle: | Opérations réussies |
| **Warning** | :material-alert: | Situations à surveiller |
| **Error** | :material-close-circle: | Erreurs et problèmes |

---

## Filtrer les logs

Tu peux filtrer les logs pour ne voir que ce qui t'intéresse :

### Par bot

Sélectionne un bot spécifique pour ne voir que ses logs.

### Par recherche

Utilise la barre de recherche pour trouver un événement précis.

---

## Informations d'un log

Chaque entrée contient :

```
┌──────────────────────────────────────────────┐
│ 🔵 INFO                    14:32:05          │
│                                              │
│ Bot "MusicBot" ajouté                        │
│ Action: bot_created                          │
│ Bot: MusicBot                                │
└──────────────────────────────────────────────┘
```

| Champ | Description |
|---|---|
| **Niveau** | Info, Success, Warning, Error |
| **Timestamp** | Date et heure de l'événement |
| **Message** | Description de l'action |
| **Action** | Type d'action technique |
| **Bot** | Bot concerné (si applicable) |

---

## Limites

!!! info "Stockage des logs"

    - Les logs sont stockés localement (AsyncStorage)
    - Maximum **1 000 entrées** conservées
    - Les plus anciennes sont automatiquement supprimées quand la limite est atteinte

---

## Vider les logs

Pour effacer tout l'historique :

1. Va dans l'onglet **Logs**
2. Clique sur **Vider les logs**
3. Confirme

!!! warning "Irréversible"

    Les logs supprimés ne peuvent pas être récupérés.
