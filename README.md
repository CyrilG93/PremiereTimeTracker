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
- **Auto-pause notice**: A modal notification is shown at timeout; clicking OK resumes tracking immediately
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
## 📜 Changelog

### 1.3.0
- Added CSV configuration import/export (JSON) to reuse setups across machines.
- Added named CSV presets with alphabetical preset selector.
- Added multilingual UI support: Deutsch, English, Español, Français, Italiano, Português (Brasil), Русский, 日本語, 简体中文.
- Localized CSV column type labels and Debug Logs labels.
- Improved CSV type dropdown behavior in constrained panel space.
- Improved settings readability with larger typography.
- Improved auto-pause behavior to prevent repeated notifications.
- Added/normalized additional CSV date formats (`MM/DD/YYYY` and `DD/MM/YYYY`).

### 1.2.0
- Added and stabilized in-app GitHub update checking system.

### 1.1.3
- Fixed auto-pause alert loop issue.

### 1.1.2
- Added persistent data storage across Premiere versions.

### 1.1.1
- Release packaging and installer updates.
