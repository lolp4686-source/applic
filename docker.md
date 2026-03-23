# Design responsive

## Breakpoints

| Largeur | Type | Navigation | Grille bots |
|---|---|---|---|
| < 600px | Mobile | Bottom tabs | 1 colonne |
| 600–767px | Tablette portrait | Bottom tabs | 2 colonnes |
| 768–1023px | Tablette paysage | Drawer (sidebar) | 2 colonnes |
| ≥ 1024px | Desktop | Drawer (sidebar) | 3 colonnes |

## Adaptation automatique

Le système utilise `useWindowDimensions()` de React Native pour détecter la largeur en temps réel. L'interface s'adapte automatiquement :

- **Navigation** : switch tabs ↔ drawer à 768px
- **Grilles** : `FlatList` avec `numColumns` dynamique
- **Layouts** : flexDirection colonne ↔ row selon la largeur
- **Formulaires** : `maxWidth: 600` centré sur grand écran

## Composants adaptatifs

### DashboardScreen
- Stats : empilées verticalement (mobile) / en ligne (≥ 768px)

### BotListScreen
- Grille : 1/2/3 colonnes selon la largeur

### BotDetailScreen
- Info + Logs : empilés (mobile) / côte à côte (≥ 768px)

### Formulaires (Add/Edit)
- Largeur max 600px, centré sur grands écrans
