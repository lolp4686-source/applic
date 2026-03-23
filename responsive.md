# Architecture de l'application

## Stack technique

| Technologie | Rôle |
|---|---|
| React Native + Expo | Framework cross-platform (iOS, Windows, Web) |
| TypeScript | Typage statique |
| React Navigation | Navigation (tabs, drawer, stack) |
| AsyncStorage | Persistance locale des données |
| React Context + useReducer | Gestion d'état |

## Structure du projet

```
Nathan-dash/
├── App.tsx                    # Point d'entrée
├── src/
│   ├── types/index.ts         # Types TypeScript (Bot, LogEntry, etc.)
│   ├── theme/index.ts         # Couleurs, espacements, tailles
│   ├── context/BotContext.tsx  # État global (bots + logs)
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Navigation responsive (tabs/drawer)
│   ├── components/
│   │   ├── BotCard.tsx        # Carte de bot dans la liste
│   │   ├── Card.tsx           # Composant carte générique
│   │   ├── EmptyState.tsx     # État vide
│   │   ├── LogItem.tsx        # Ligne de log
│   │   └── StatusBadge.tsx    # Badge de statut (en ligne, erreur...)
│   └── screens/
│       ├── DashboardScreen.tsx
│       ├── BotListScreen.tsx
│       ├── BotDetailScreen.tsx
│       ├── BotAddScreen.tsx
│       ├── BotEditScreen.tsx
│       ├── LogsScreen.tsx
│       └── SettingsScreen.tsx
└── doc/                       # Documentation
```

## Navigation responsive

- **Mobile (< 768px)** : Bottom tab bar avec 4 onglets
- **Tablette/Desktop (≥ 768px)** : Drawer (sidebar) navigation
- Le switch est automatique via `useWindowDimensions()`

## Gestion d'état

Un seul `BotContext` centralisé avec `useReducer` :
- **Bots** : CRUD complet (ajout, modification, suppression, changement de statut)
- **Logs** : Ajout automatique à chaque action, max 1000 entrées
- **Persistance** : Sauvegarde automatique dans AsyncStorage
