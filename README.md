# Premiere Time Tracker

CEP Extension for Adobe Premiere Pro 2025 (25.5+) to track time spent on each project.

## ✨ Features

- ⏱️ **Automatic tracking** - Detects project open/close
- 📊 **CSV export** - Exports data with 14 formatted columns
- 🔄 **Multi-sessions** - Each opening creates a new entry
- 📁 **Project name** - Automatically extracts the project folder name
- 🔀 **Optional merge** - Merges sessions from the same day
- ⏸️ **Auto-pause** - Automatic pause after X minutes of inactivity
- 🌐 **Bilingual** - Interface in French and English
- 💾 **Persistent storage** - Data saved in `~/Documents/TimeTracker_data.json`
- 🔄 **Auto-save** - Saves every 30 seconds during tracking
- 🐛 **Debug logs** - Built-in log panel to diagnose issues

## 📦 Installation

### macOS

1. Double-click on `install_mac.sh` or run in Terminal:
   ```bash
   chmod +x install_mac.sh && ./install_mac.sh
   ```

2. Restart Adobe Premiere Pro

3. Open: **Window > Extensions > Time Tracker**

### Windows

1. Double-click on `install_windows.bat`

2. Restart Adobe Premiere Pro

3. Open: **Window > Extensions > Time Tracker**

## 🚀 Usage

### Tracking
1. Open the extension in Premiere Pro
2. Tracking starts automatically when a project is open
3. Time is displayed in green when tracking is active
4. Data is automatically saved every 30 seconds

### CSV Export
1. Click the **Export** button
2. A CSV file is saved to the Desktop

### Export format
| Column | Content |
|--------|---------|
| A | Empty |
| B | Date (M/D/YYYY) |
| C | Date (M/D/YYYY) |
| D | Open time (HH:MM AM/PM) |
| E | Close time (HH:MM AM/PM) |
| F | Duration (H:MM) |
| G | Platform (MacOS/Windows) |
| H | "Editing AV room" |
| I | "Editing" |
| J | "Confirmed" |
| K-L | Empty |
| M | Project name |
| N | Location |

### Settings
- **Merge same day**: Groups sessions of the same project on the same day
- **Auto-pause**: Pauses tracking after X minutes of inactivity
- **Timeout**: Delay before auto-pause (default: 30 min)
- **Language**: English or French
- **Debug Logs**: Displays the log panel to diagnose issues

## 📁 Data storage

Data is stored in a persistent JSON file:
```
~/Documents/TimeTracker_data.json
```

This file contains all sessions and settings, and is not deleted during Premiere Pro updates.

## 🔧 Uninstallation

### macOS
```bash
rm -rf "$HOME/Library/Application Support/Adobe/CEP/extensions/PremiereTimeTracker"
```

### Windows
```cmd
rmdir /s /q "%APPDATA%\Adobe\CEP\extensions\PremiereTimeTracker"
```

## 📝 Compatibility

- Adobe Premiere Pro 2025 (25.5+)
- macOS & Windows

## 👤 Author

CyrilG93

## 📄 License

MIT License

---

# 🇫🇷 Version Française

---

# Premiere Time Tracker

Extension CEP pour Adobe Premiere Pro 2025 (25.5+) permettant de tracker le temps passé sur chaque projet.

## ✨ Fonctionnalités

- ⏱️ **Tracking automatique** - Détecte l'ouverture/fermeture des projets
- 📊 **Export CSV** - Exporte les données avec 14 colonnes formatées
- 🔄 **Multi-sessions** - Chaque ouverture crée une nouvelle entrée
- 📁 **Nom du projet** - Extrait automatiquement le nom du dossier projet
- 🔀 **Fusion optionnelle** - Fusionne les sessions du même jour
- ⏸️ **Auto-pause** - Pause automatique après X minutes d'inactivité
- 🌐 **Bilingue** - Interface en français et anglais
- 💾 **Stockage persistant** - Données sauvegardées dans `~/Documents/TimeTracker_data.json`
- 🔄 **Auto-sauvegarde** - Sauvegarde toutes les 30 secondes pendant le tracking
- 🐛 **Debug logs** - Panneau de logs intégré pour diagnostiquer les problèmes

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
4. Les données sont sauvegardées automatiquement toutes les 30 secondes

### Export CSV
1. Cliquez sur le bouton **Export**
2. Un fichier CSV est sauvegardé sur le Bureau

### Format d'export
| Colonne | Contenu |
|---------|---------|
| A | Vide |
| B | Date (M/D/YYYY) |
| C | Date (M/D/YYYY) |
| D | Heure ouverture (HH:MM AM/PM) |
| E | Heure fermeture (HH:MM AM/PM) |
| F | Durée (H:MM) |
| G | Plateforme (MacOS/Windows) |
| H | "Editing AV room" |
| I | "Editing" |
| J | "Confirmed" |
| K-L | Vide |
| M | Nom du projet |
| N | Emplacement |

### Paramètres
- **Fusionner même jour** : Regroupe les sessions d'un même projet le même jour
- **Auto-pause** : Pause le tracking après X minutes d'inactivité
- **Timeout** : Délai avant auto-pause (défaut: 30 min)
- **Langue** : Anglais ou Français
- **Debug Logs** : Affiche le panneau de logs pour diagnostiquer les problèmes

## 📁 Stockage des données

Les données sont stockées dans un fichier JSON persistant :
```
~/Documents/TimeTracker_data.json
```

Ce fichier contient toutes les sessions et paramètres, et n'est pas effacé lors des mises à jour de Premiere Pro.

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
