# Premiere Time Tracker

CEP Extension for Adobe Premiere Pro 2025 (25.5+) to track time spent on each project.

## ✨ Features

- ⏱️ **Automatic tracking** - Detects project open/close
- 📊 **CSV export** - Exports data with 14 formatted columns
- 🔄 **Multi-sessions** - Each opening creates a new entry
- 📁 **Project name** - Automatically extracts the project folder name
- 🔀 **Optional merge** - Merges sessions from the same day
- ⏸️ **Auto-pause** - Automatic pause after X minutes of inactivity
- 🌐 **Multilingual** - Interface available in Deutsch, English, Español, Français, Italiano, Português (Brasil), Русский, 日本語, 简体中文
- 💾 **Persistent storage** - Data saved in `Application Support` (Mac) or `AppData` (Win)
- 🔄 **Auto-save** - Saves every 30 seconds during tracking
- 🐛 **Debug logs** - Built-in log panel to diagnose issues
- 💼 **CSV config import/export** - Save and reuse CSV column mapping on another computer
- 🧩 **CSV presets** - Save named column setups and load them from an alphabetical dropdown

## 📦 Installation

### macOS

1. Open Terminal.
2. **Easiest method (recommended):** drag and drop `install_mac.sh` into the Terminal window, then press Enter.
3. **Manual method (command line):** run:
   ```bash
   cd /path/to/PremiereTimeTracker
   chmod +x install_mac.sh
   ./install_mac.sh
   ```

4. Restart Adobe Premiere Pro

5. Open: **Window > Extensions > Time Tracker**

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
| A-N | **Customizable** - Configure each of the 14 columns in Settings |

### Column Options
- Empty
- Date (MM/DD/YYYY)
- Date (DD/MM/YYYY)
- Open Time
- Close Time
- Duration
- Platform
- Project Name
- Project Path
- Fixed Text (Custom value)

### Settings
- **Merge same day**: Groups sessions of the same project on the same day
- **Auto-pause**: Pauses tracking after X minutes of inactivity
- **Auto-pause notice**: Only one warning is shown; click dismiss once to resume tracking until the next timeout
- **Timeout**: Delay before auto-pause (default: 30 min)
- **Language**: Deutsch, English, Español, Français, Italiano, Português (Brasil), Русский, 日本語, 简体中文
- **CSV Columns**: Customize the content of the 14 export columns
- **Localized labels**: CSV column type options and Debug Logs labels follow the selected language
- **CSV Config Import/Export**: Save the current column setup to JSON and import it on another machine
- **CSV Presets**: Save the current setup with a custom name and load presets sorted alphabetically
- **Debug Logs**: Displays the log panel to diagnose issues

## 📁 Data storage

Data is stored in a persistent JSON file:
**macOS:** `~/Library/Application Support/PremiereTimeTracker/timeTracker_data.json`
**Windows:** `%APPDATA%\PremiereTimeTracker\timeTracker_data.json`

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
- 🌐 **Multilingue** - Interface disponible en Deutsch, English, Español, Français, Italiano, Português (Brasil), Русский, 日本語, 简体中文
- 💾 **Stockage persistant** - Données sauvegardées dans `Application Support` (Mac) ou `AppData` (Win)
- 🔄 **Auto-sauvegarde** - Sauvegarde toutes les 30 secondes pendant le tracking
- 🐛 **Debug logs** - Panneau de logs intégré pour diagnostiquer les problèmes
- 💼 **Import/Export config CSV** - Sauvegarde et réutilisation du mapping des colonnes sur un autre ordinateur
- 🧩 **Presets CSV** - Sauvegarde de configurations nommées avec chargement via liste triée alphabétiquement

## 📦 Installation

### macOS

1. Ouvrez le Terminal.
2. **Méthode la plus simple (recommandée)** : glissez-déposez `install_mac.sh` dans la fenêtre du Terminal, puis appuyez sur Entrée.
3. **Méthode manuelle (ligne de commande)** : lancez :
   ```bash
   cd /chemin/vers/PremiereTimeTracker
   chmod +x install_mac.sh
   ./install_mac.sh
   ```

4. Redémarrez Adobe Premiere Pro

5. Ouvrez : **Fenêtre > Extensions > Time Tracker**

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
| A-N | **Personnalisable** - Configurez chacune des 14 colonnes dans les Paramètres |

### Options de colonnes
- Vide
- Date (MM/DD/YYYY)
- Date (DD/MM/YYYY)
- Heure ouverture
- Heure fermeture
- Durée
- Plateforme
- Nom du projet
- Chemin du projet
- Texte fixe (Valeur personnalisée)

### Paramètres
- **Fusionner même jour** : Regroupe les sessions d'un même projet le même jour
- **Auto-pause** : Pause le tracking après X minutes d'inactivité
- **Notification auto-pause** : Une seule alerte est affichée ; un clic sur fermer relance le tracking jusqu'au prochain délai
- **Timeout** : Délai avant auto-pause (défaut: 30 min)
- **Langue** : Deutsch, English, Español, Français, Italiano, Português (Brasil), Русский, 日本語, 简体中文
- **Colonnes CSV** : Personnalisez le contenu des 14 colonnes d'export
- **Libellés localisés** : Les options du type de colonne CSV et les labels Debug Logs suivent la langue sélectionnée
- **Import/Export config CSV** : Sauvegardez la configuration actuelle en JSON et importez-la sur une autre machine
- **Presets CSV** : Sauvegardez la config actuelle avec un nom personnalisé et chargez les presets en ordre alphabétique
- **Debug Logs** : Affiche le panneau de logs pour diagnostiquer les problèmes

## 📁 Stockage des données

Les données sont stockées dans un fichier JSON persistant :
**macOS :** `~/Library/Application Support/PremiereTimeTracker/timeTracker_data.json`
**Windows :** `%APPDATA%\PremiereTimeTracker\timeTracker_data.json`

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
