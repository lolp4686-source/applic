# Fonctionnalités

## Gestion multi-bots

### Ajouter un bot
- Nom, token Discord, préfixe de commande
- Le token est stocké localement (jamais envoyé à un serveur tiers)

### Vue liste
- Grille responsive : 1 colonne (mobile), 2 colonnes (tablette), 3 colonnes (desktop)
- Chaque bot affiche son nom, préfixe, statut, et un bouton démarrer/arrêter
- Clic sur la carte → vue détaillée

### Vue détaillée par bot
- Informations complètes (nom, token masqué, préfixe, date de création)
- Actions : Démarrer / Arrêter / Modifier / Supprimer
- Logs spécifiques au bot affichés directement dans la vue
- Layout responsive : colonne unique (mobile) ou côte à côte (desktop)

### Modifier un bot
- Édition du nom, token, préfixe
- Validation avant sauvegarde

### Supprimer un bot
- Confirmation via Alert avant suppression
- Suppression des logs associés

## Système de logs

### Logs automatiques
Chaque action génère un log horodaté :
- Création de bot → `success`
- Modification → `info`
- Suppression → `warn`
- Changement de statut → `success` / `info` / `error`

### Vue logs globale
- Liste chronologique de tous les logs
- Filtrage par bot via chips cliquables
- Bouton "Effacer" (tous ou par bot)

### Niveaux de log
| Niveau | Couleur | Usage |
|---|---|---|
| `info` | Bleu | Actions générales |
| `success` | Vert | Succès (démarrage, création) |
| `warn` | Jaune | Avertissements (suppression) |
| `error` | Rouge | Erreurs |

## Tableau de bord

- Statistiques : nombre total de bots, bots en ligne, erreurs
- 10 derniers logs d'activité
- Layout responsive (stats en colonne sur mobile, en ligne sur desktop)

## Paramètres

- Informations sur l'application (version, plateforme)
- Note sur la sécurité des données
