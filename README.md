# Premiere Time Tracker

Extension CEP pour Adobe Premiere Pro 2025 (25.5+) permettant de tracker le temps passé sur chaque projet.

## ✨ Fonctionnalités

- ⏱️ **Tracking automatique** - Détecte l'ouverture/fermeture des projets
- 📊 **Export CSV** - Exporte les données avec 14 colonnes formatées
- 🔄 **Multi-sessions** - Chaque ouverture crée une nouvelle entrée
- 📁 **Nom du projet** - Extrait automatiquement le nom du dossier projet
- 🔀 **Fusion optionnelle** - Fusionne les sessions du même jour
- ⏰ **Alerte inactivité** - Détecte si un projet n'est pas suivi
- 🌐 **Bilingue** - Interface en français et anglais
- 💾 **Stockage persistant** - Les données sont conservées entre les sessions

## 📦 Installation

### macOS

1. Double-cliquez sur `install_mac.sh` ou exécutez dans le Terminal :
   ```bash
   chmod +x install_mac.sh && ./install_mac.sh
   ```

2. Redémarrez Adobe Premiere Pro

3. Ouvrez : **Fenêtre > Extensions > Time Tracker**

### Windows

1. Double-cliquez sur `install_windows.bat`

2. Redémarrez Adobe Premiere Pro

3. Ouvrez : **Window > Extensions > Time Tracker**

## 🚀 Utilisation

### Tracking
1. Ouvrez l'extension dans Premiere Pro
2. Le tracking démarre automatiquement quand un projet est ouvert
3. Le temps s'affiche en vert quand le tracking est actif

### Export CSV
1. Cliquez sur le bouton **Export CSV**
2. Un fichier CSV est téléchargé avec toutes les sessions

### Format d'export
| Colonne | Contenu |
|---------|---------|
| A | Vide |
| B | Date (M/D/YYYY) |
| C | Date (M/D/YYYY) |
| D | Heure ouverture (HH:MM AM/PM) |
| E | Heure fermeture (HH:MM AM/PM) |
| F | Durée (Xh Ym) |
| G | Vide |
| H | "Editing AV room" |
| I | "Editing" |
| J | "Confirmed" |
| K-L | Vide |
| M | Nom du projet |
| N | Emplacement |

### Paramètres
- **Fusionner même jour** : Regroupe les sessions d'un même projet le même jour
- **Alerte inactivité** : Délai avant alerte si projet non suivi (défaut: 30 min)
- **Langue** : Anglais ou Français

## 🔧 Désinstallation

### macOS
```bash
rm -rf "$HOME/Library/Application Support/Adobe/CEP/extensions/PremiereTimeTracker"
```

### Windows
```cmd
rmdir /s /q "%APPDATA%\Adobe\CEP\extensions\PremiereTimeTracker"
```

## 📝 Compatibilité

- Adobe Premiere Pro 2025 (25.5+)
- macOS & Windows

## 👤 Auteur

CyrilG93

## 📄 Licence

MIT License
